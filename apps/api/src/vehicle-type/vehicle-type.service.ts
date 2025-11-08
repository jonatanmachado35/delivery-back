import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { VehicleType } from "@prisma/client"
import { CreateVehicleTypeDto } from "./dto/create-vehicle-type.dto"
import { UpdateVehicleTypeDto } from "./dto/update-vehicle-type.dto"
import { IPaginateResponse, paginateResponse } from "../utils/fn"
import { Decimal } from "@prisma/client/runtime/library"
import { IRoute } from "../typing/location"

@Injectable()
export class VehicleTypeService {
  constructor(private prisma: PrismaService) {}

  async findOne(type: string): Promise<VehicleType> {
    const vehicleType = await this.prisma.vehicleType.findUnique({
      where: { type },
    })

    if (!vehicleType) {
      throw new NotFoundException(
        `Tipo de veiculo '${type}' não foi encontrado`
      )
    }

    return vehicleType
  }

  async delete(type: string): Promise<void> {
    const vehicleType = await this.prisma.vehicleType.findUnique({
      where: { type },
      select: { id: true },
    })

    if (!vehicleType) {
      throw new NotFoundException(
        `Tipo de veiculo '${type}' nao foi encontrado`
      )
    }

    await this.prisma.vehicleType.delete({
      where: {
        id: vehicleType.id,
      },
    })
  }

  calculatePrice(vehicleType: VehicleType, geoInfo: IRoute): number {
    const distanceKM = geoInfo.distance

    const precoBasePrimeiros5KM = vehicleType.tarifaBase.toNumber()

    const kmAdicionais = Math.max(0, distanceKM - 5)
    const precoKMAdicionais =
      kmAdicionais * vehicleType.valorKMAdicional.toNumber()

    const precoTotal = precoBasePrimeiros5KM + precoKMAdicionais

    return Math.round(precoTotal * 100) / 100
  }

  async update(
    type: string,
    updateVehicleTypeDto: UpdateVehicleTypeDto
  ): Promise<void> {
    const vehicleType = await this.prisma.vehicleType.findUnique({
      where: { type },
      select: { id: true },
    })

    if (!vehicleType) {
      throw new NotFoundException(
        `Tipo de veiculo '${type}' nao foi encontrado`
      )
    }

    if (updateVehicleTypeDto.type) {
      const conflict = await this.prisma.vehicleType.findFirst({
        where: {
          type: updateVehicleTypeDto.type,
          id: {
            not: vehicleType.id,
          },
        },
      })

      if (conflict) {
        throw new ConflictException(`Tipo de veiculo '${type}' já existe`)
      }
    }

    const vehicleTypeDto = {
      tarifaBase: updateVehicleTypeDto.tarifaBase as unknown as Decimal,
      valorKMAdicional:
        updateVehicleTypeDto.valorKMAdicional as unknown as Decimal,
      paradaAdicional:
        updateVehicleTypeDto.paradaAdicional as unknown as Decimal,
      ajudanteAdicional:
        updateVehicleTypeDto.ajudanteAdicional as unknown as Decimal,
      type: updateVehicleTypeDto.type,
    }

    await this.prisma.vehicleType.update({
      where: { id: vehicleType.id },
      data: vehicleTypeDto,
    })
  }

  async create(body: CreateVehicleTypeDto): Promise<void> {
    const conflict = await this.prisma.vehicleType.findFirst({
      where: {
        type: body.type,
      },
    })

    if (conflict) {
      throw new ConflictException(`Tipo de veiculo '${body.type}' já existe`)
    }

    const vehicleTypeDto = {
      type: body.type,
      tarifaBase: new Decimal(body.tarifaBase),
      valorKMAdicional: new Decimal(body.valorKMAdicional),
      paradaAdicional: new Decimal(body.paradaAdicional || 0),
      ajudanteAdicional: new Decimal(body.ajudanteAdicional || 0),
    }

    await this.prisma.vehicleType.create({
      data: vehicleTypeDto,
    })
  }

  async findAll(
    page: number,
    registers: number
  ): Promise<IPaginateResponse<Partial<VehicleType>>> {
    const where = {}

    const [data, total] = await Promise.all([
      this.prisma.vehicleType.findMany({
        where,
        omit: { createdAt: true, updatedAt: true },
        skip: (page - 1) * registers,
        take: registers,
      }),

      this.prisma.vehicleType.count({
        where,
      }),
    ])

    return paginateResponse(data, page, registers, total)
  }
}
