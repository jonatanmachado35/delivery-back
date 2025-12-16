/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common"
import {
  DeliveryCreateDto,
  DeliveryCreateResponse,
} from "./dto/delivery-create.dto"
import { DeliverySimulateDto } from "./dto/delivery-simulate.dto"
import { PrismaService } from "../prisma/prisma.service"
import { VehicleTypeService } from "../vehicle-type/vehicle-type.service"
import { LocationService } from "../location/location.service"
import { DeliveryStatus, ExtractType, NotificationActionStatus, NotificationStatus, NotificationType, Prisma, Role, User, UserStatus, VehicleType } from "@prisma/client"
import { createCode, paginateResponse } from "../utils/fn"
import { CacheService } from "../cache/cache.service"
import { DeliverySimulationResponseDto } from "./dto/delivery-simulation-response.dto"
import { DeliveryQueryParams } from "./dto/filters.dto"
import { DeliveryPaginate, DeliveryPaginateResponse } from "./dto/delivery-paginate-response.dto"
import { DeliveryStatusUpdateDto, DeliveryStatusUpdateResponseDto } from "./dto/delivery-status-update.dto"

@Injectable()
export class DeliveryService {
  constructor(
    private prismaService: PrismaService,
    private vehicleType: VehicleTypeService,
    private locationService: LocationService,
    private cacheService: CacheService
  ) { }

  async paginate(
    filter: DeliveryQueryParams,
    page: number,
    limit: number
  ): Promise<DeliveryPaginateResponse> {
    const where: Prisma.DeliveryWhereInput = {
      ...(filter.user.role === Role.COMPANY && {
        Company: {
          is: {
            idUser: filter.user.id,
          },
        },
      }),
      ...(filter.code && {
        code: {
          contains: filter.code,
          mode: "insensitive",
        },
      }),
      ...(filter.status && {
        status: filter.status,
      }),
      ...(filter.vehicleType && {
        vehicleType: filter.vehicleType,
      }),
      ...(filter.isFragile !== undefined && {
        isFragile: filter.isFragile === "true",
      }),
      ...((filter.minPrice || filter.maxPrice) && {
        price: {
          ...(filter.minPrice && { gte: parseFloat(filter.minPrice) }),
          ...(filter.maxPrice && { lte: parseFloat(filter.maxPrice) }),
        },
      }),
      ...((filter.completedFrom || filter.completedTo) && {
        completedAt: {
          ...(filter.completedFrom && { gte: new Date(filter.completedFrom) }),
          ...(filter.completedTo && { lte: new Date(filter.completedTo) }),
        },
      }),
      ...(filter.originCity && {
        OriginAddress: {
          city: {
            contains: filter.originCity,
            mode: "insensitive",
          },
        },
      }),
      ...(filter.clientCity && {
        ClientAddress: {
          city: {
            contains: filter.clientCity,
            mode: "insensitive",
          },
        },
      }),
    }

    const [data, count] = await Promise.all([
      this.prismaService.delivery.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        omit: {
          idClientAddress: true,
          idOriginAddress: true,
          createdAt: true,
          updatedAt: true,
          deliveryManId: true,
          companyId: true,
        },
        include: {
          Company: {
            select: {
              name: true,
            },
          },
          ClientAddress: true,
          OriginAddress: true,
        },
      }),
      this.prismaService.delivery.count({
        where,
      }),
    ])

    return paginateResponse(
      data,
      page,
      limit,
      count
    ) as unknown as DeliveryPaginateResponse
  }

  async simulateDelivery(
    body: DeliverySimulateDto,
    idUser: number
  ): Promise<DeliverySimulationResponseDto> {
    const companyLocalization = body.useAddressCompany
      ? await this.locationService.getAddressLocalizationByUser(
        this.prismaService,
        idUser,
        "companies"
      )
      : await this.locationService.reverse(
        body.address.city,
        body.address.state,
        body.address.street,
        body.address.number,
        body.address.zipCode
      )

    const key = `simulate:${body.vehicleType}:${companyLocalization.longitude}:${companyLocalization.latitude}:${body.clientAddress.city}:${body.clientAddress.state}:${body.clientAddress.street}:${body.clientAddress.number}:${body.clientAddress.zipCode}`
    const cache = await this.cacheService.getValue(key)

    if (cache) {
      return JSON.parse(cache) as DeliverySimulationResponseDto
    }

    const vehicleType: VehicleType = await this.vehicleType.findOne(
      body.vehicleType
    )

    if (!vehicleType) {
      throw new NotFoundException(
        `Tipo de veiculo '${body.vehicleType}' nao foi encontrado`
      )
    }

    const location = await this.locationService.reverse(
      body.clientAddress.city,
      body.clientAddress.state,
      body.clientAddress.street,
      body.clientAddress.number,
      body.clientAddress.zipCode
    )

    const geoInfo = await this.locationService.findDistance(
      location,
      companyLocalization
    )

    const price = this.vehicleType.calculatePrice(vehicleType, geoInfo)

    const result = {
      location: geoInfo,
      price,
    }

    await this.cacheService.setCache(key, JSON.stringify(result), 60 * 60)

    return result
  }

  generatePrefix(str: string): string {
    const words = str.toLocaleUpperCase().split(" ")

    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).concat("-")
    }

    return words[0].substring(0, 2).concat("-")
  }

  async generateCode(_prefix = "BR"): Promise<string> {
    const prefix = this.generatePrefix(_prefix)

    let code = createCode(4, prefix)

    while (true) {
      const delivery = await this.prismaService.delivery.findFirst({
        where: {
          code,
        },
        select: {
          id: true,
        },
      })

      if (!delivery) {
        break
      }

      code = createCode(4, prefix)
    }

    return code
  }

  async createDelivery(
    body: DeliveryCreateDto,
    idUser: number
  ): Promise<DeliveryCreateResponse> {
    return this.prismaService.$transaction(async (prisma) => {
      const { price } = await this.simulateDelivery(body, idUser)

      const clientAddress = await this.locationService.createAddress(
        prisma as PrismaService,
        body.clientAddress
      )

      if (body.useAddressCompany) {
        body.address = await this.locationService.getAddressByUser(
          prisma as PrismaService,
          idUser,
          "companies"
        )
      }

      const originAddress = await this.locationService.createAddress(
        prisma as PrismaService,
        body.address
      )

      if (!clientAddress || !originAddress) {
        throw new Error("Failed to create addresses")
      }

      const vehicleType = await this.vehicleType.findOne(body.vehicleType)

      if (!vehicleType) {
        throw new NotFoundException(
          `Tipo de veiculo '${body.vehicleType}' não foi encontrado`
        )
      }

      const code = await this.generateCode(body.clientAddress.street)

      await prisma.delivery.create({
        data: {
          code,
          height: body.height,
          width: body.width,
          length: body.length,
          weight: body.weight,
          information: body.information.trim(),
          price,
          email: body.email.trim(),
          telefone: body.telefone.trim(),
          vehicleType: body.vehicleType,
          isFragile: body.isFragile,
          status: DeliveryStatus.PENDING,
          Company: {
            connect: {
              idUser,
            },
          },
          ClientAddress: {
            connect: {
              id: clientAddress.id,
            },
          },
          OriginAddress: {
            connect: {
              id: originAddress.id,
            },
          },
        },
      })

      return {
        code,
      }
    })
  }

  async findByCode(code: string, userId: number): Promise<DeliveryPaginate> {
    console.log(`findByCode called with code: ${code} and userId: ${userId}`)
    const delivery = await this.prismaService.delivery.findFirst({
      where: {
        code,
        Company: {
          is: {
            idUser: userId,
          },
        },
      },
      include: {
        Company: {
          select: {
            name: true,
            phone: true,
            Address: {
              select: {
                street: true,
                number: true,
                city: true,
                state: true,
                zipCode: true,
                complement: true,
              },
            },
          },
        },
        ClientAddress: true,
        OriginAddress: true,
      },
    });

    console.log("Delivery found:", delivery)

    if (!delivery) {
      throw new NotFoundException(`Delivery with code ${code} not found.`);
    }

    // Manually construct the 'address' property for the Company
    if (delivery.Company && delivery.Company.Address) {
      const address = delivery.Company.Address;
      (delivery.Company as any).address = `${address.street}, ${address.number} - ${address.city}, ${address.state} - ${address.zipCode}${address.complement ? ` (${address.complement})` : ''}`;
    }
    return delivery as unknown as DeliveryPaginate;
  }

  async updateStatus(
    deliveryId: number,
    user: Pick<User, "id" | "role">,
    body: DeliveryStatusUpdateDto
  ): Promise<DeliveryStatusUpdateResponseDto> {
    console.log("updateStatus CALLED", { deliveryId, status: body.status, userId: user.id });

    if (!Number.isInteger(deliveryId) || deliveryId <= 0) {
      throw new BadRequestException("Identificador da entrega inválido.")
    }

    if (user.role !== Role.DELIVERY) {
      throw new ForbiddenException("Apenas entregadores podem alterar status.")
    }

    const deliveryman = await this.prismaService.deliveryMan.findUnique({
      where: { userId: user.id },
      select: { id: true, userId: true },
    })

    if (!deliveryman) {
      throw new ForbiddenException("Entregador não encontrado para o usuário.")
    }

    const delivery = await this.prismaService.delivery.findUnique({
      where: { id: deliveryId },
      select: {
        id: true,
        code: true,
        status: true,
        deliveryManId: true,
        price: true,
      },
    })

    if (!delivery) {
      throw new NotFoundException("Entrega não encontrada.")
    }

    // Verify ownership only if NOT pending (if pending, anyone can "claim" it)
    if (delivery.status !== DeliveryStatus.PENDING && delivery.deliveryManId !== deliveryman.id) {
      throw new ForbiddenException("Esta entrega não está atribuída a você.")
    }

    const newStatus = this.mapIncomingStatus(body.status)
    this.ensureValidTransition(delivery.status, newStatus)

    const result = await this.prismaService.$transaction(async (tx) => {
      const data: Prisma.DeliveryUpdateInput = {
        status: newStatus,
        completedAt:
          newStatus === DeliveryStatus.COMPLETED ? new Date() : null,
        // If we are starting the delivery (PENDING -> IN_PROGRESS), assign it to this user
        ...(delivery.status === DeliveryStatus.PENDING && newStatus === DeliveryStatus.IN_PROGRESS ? {
          deliveryManId: deliveryman.id
        } : {})
      }

      const updated = await tx.delivery.update({
        where: { id: deliveryId },
        data,
        select: {
          id: true,
          code: true,
          status: true,
          completedAt: true,
        },
      })

      // If delivery is completed, update balance and create extract
      if (newStatus === DeliveryStatus.COMPLETED) {
        console.log("Delivery completed. Updating balance...", { deliveryId, price: delivery.price, userId: deliveryman.userId })

        const userWithBalance = await tx.user.findUnique({
          where: { id: deliveryman.userId },
          select: { balanceId: true },
        })

        console.log("User found for balance update:", userWithBalance)

        if (userWithBalance?.balanceId) {
          // Update Balance
          const balanceUpdate = await tx.balance.update({
            where: { id: userWithBalance.balanceId },
            data: {
              amount: {
                increment: delivery.price,
              },
            },
          })
          console.log("Balance updated:", balanceUpdate)

          // Create Extract
          await tx.extract.create({
            data: {
              amount: delivery.price,
              type: ExtractType.CREDIT, // Credit for the delivery man
              userId: deliveryman.userId,
              description: `Entrega ${updated.code} concluída`,
            },
          })
          console.log("Extract created")

          // Buscar informações do entregador para notificação
          const deliverymanInfo = await tx.user.findUnique({
            where: { id: deliveryman.userId },
            select: {
              email: true,
              DeliveryMan: {
                select: {
                  name: true,
                },
              },
            },
          })

          // Criar notificação para todos os admins sobre entrega concluída
          const admins = await tx.user.findMany({
            where: { role: Role.ADMIN, status: UserStatus.ACTIVE },
            select: { id: true },
          })

          if (admins.length > 0) {
            await tx.notification.createMany({
              data: admins.map((admin) => ({
                type: NotificationType.INFO,
                status: NotificationStatus.READ,
                requiresAction: false,
                actionStatus: NotificationActionStatus.APPROVED,
                title: 'Entrega Concluída',
                message: `${deliverymanInfo?.DeliveryMan?.name || 'Entregador'} concluiu a entrega ${updated.code} no valor de R$ ${Number(delivery.price).toFixed(2)}.`,
                recipientId: admin.id,
                senderId: deliveryman.userId,
              })),
            })
          }
        } else {
          console.error("User has no balanceId!", deliveryman.userId)
        }
      }

      return updated
    })

    return {
      id: result.id,
      code: result.code,
      status: this.mapStatusToResponse(result.status),
      deliveredAt: result.completedAt?.toISOString(),
    }
  }

  private mapIncomingStatus(status: string): DeliveryStatus {
    const normalized = status.trim().toLowerCase()

    if (normalized === "pending") {
      return DeliveryStatus.PENDING
    }

    if (normalized === "in_transit" || normalized === "in_progress") {
      return DeliveryStatus.IN_PROGRESS
    }

    if (normalized === "delivered" || normalized === "completed") {
      return DeliveryStatus.COMPLETED
    }

    if (normalized === "cancelled" || normalized === "canceled") {
      return DeliveryStatus.CANCELED
    }

    throw new BadRequestException("Status inválido.")
  }

  private mapStatusToResponse(status: DeliveryStatus): string {
    switch (status) {
      case DeliveryStatus.COMPLETED:
        return "delivered"
      case DeliveryStatus.IN_PROGRESS:
        return "in_transit"
      case DeliveryStatus.CANCELED:
        return "cancelled"
      default:
        return "pending"
    }
  }

  private ensureValidTransition(
    current: DeliveryStatus,
    next: DeliveryStatus
  ): void {
    if (current === next) {
      return
    }

    if (current === DeliveryStatus.PENDING) {
      const allowed: DeliveryStatus[] = [
        DeliveryStatus.IN_PROGRESS,
        DeliveryStatus.CANCELED,
      ]
      if (!allowed.includes(next)) {
        throw new ForbiddenException("Transição de status não permitida.")
      }
      return
    }

    if (current === DeliveryStatus.IN_PROGRESS) {
      const allowed: DeliveryStatus[] = [
        DeliveryStatus.COMPLETED,
        DeliveryStatus.CANCELED,
      ]
      if (!allowed.includes(next)) {
        throw new ForbiddenException("Transição de status não permitida.")
      }
      return
    }

    throw new ForbiddenException("Transição de status não permitida.")
  }
}
