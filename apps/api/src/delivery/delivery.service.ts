/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { Injectable, NotFoundException } from "@nestjs/common"
import {
  DeliveryCreateDto,
  DeliveryCreateResponse,
} from "./dto/delivery-create.dto"
import { DeliverySimulateDto } from "./dto/delivery-simulate.dto"
import { PrismaService } from "../prisma/prisma.service"
import { VehicleTypeService } from "../vehicle-type/vehicle-type.service"
import { LocationService } from "../location/location.service"
import { DeliveryStatus, Prisma, Role, VehicleType } from "@prisma/client"
import { createCode, paginateResponse } from "../utils/fn"
import { CacheService } from "../cache/cache.service"
import { DeliverySimulationResponseDto } from "./dto/delivery-simulation-response.dto"
import { DeliveryQueryParams } from "./dto/filters.dto"
import {DeliveryPaginate, DeliveryPaginateResponse } from "./dto/delivery-paginate-response.dto"

@Injectable()
export class DeliveryService {
  constructor(
    private prismaService: PrismaService,
    private vehicleType: VehicleTypeService,
    private locationService: LocationService,
    private cacheService: CacheService
  ) {}

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
          id: true,
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
}
