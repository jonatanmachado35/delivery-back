import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserQueryParams } from './dto/filter';
import { PrismaService } from '../prisma/prisma.service';
import { IPaginateResponse, paginateResponse } from '../utils/fn';
import { LocationService } from '../location/location.service';
import { ILocalization } from '../typing/location';
import { Address, User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private locationService: LocationService,
  ) {}

  async paginate(
    filters: IUserQueryParams,
    page: number,
    registers: number,
  ): Promise<IPaginateResponse<Partial<User>>> {
    const where = {
      email: filters.email,
      status: filters.status,
      role: filters.role,
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        omit: {
          password: true,
          createdAt: true,
          updatedAt: true,
          balanceId: true,
        },
        skip: (page - 1) * registers, // Pula os itens das páginas anteriores
        take: registers,
      }),

      this.prisma.user.count({
        where,
      }),
    ]);

    return paginateResponse(users, page, registers, total);
  }

  async findOne(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        Balance: {
          select: {
            id: true,
            amount: true,
          },
        },
        Extract: {
          orderBy: { updatedAt: 'desc' },
          take: 10,
        },
        Company: {
          omit: { id: true, idUser: true, createdAt: true, updatedAt: true },
          include: {
            Address: {
              omit: {
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
        DeliveryMan: {
          omit: {
            createdAt: true,
            updatedAt: true,
            userId: true,
            idAddress: true,
            vehicleId: true,
          },
          include: {
            Address: true,
            Vehicle: {
              omit: {
                id: true,
                createdAt: true,
                updatedAt: true,
              },

              include: {
                Type: {
                  select: {
                    type: true,
                  },
                },
              },
            },
          },
        },
      },
      omit: {
        password: true,
        createdAt: true,
        updatedAt: true,
        balanceId: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`usuario com codigo '${id}' não encontrado`);
    }

    const coordinates = await this.locationService.getAddressLocalization(
      this.prisma,
      user.Company
        ? user.Company.Address.id
        : (user.DeliveryMan?.Address.id as number),
    );

    (
      (user.Company?.Address ?? user.DeliveryMan?.Address) as Address & {
        localization: ILocalization;
      }
    ).localization = coordinates;

    return user as unknown as User;
  }
}
