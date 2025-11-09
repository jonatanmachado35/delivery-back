import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserQueryParams } from './dto/filter';
import { PrismaService } from '../prisma/prisma.service';
import { IPaginateResponse, paginateResponse } from '../utils/fn';
import { LocationService } from '../location/location.service';
import { ILocalization } from '../typing/location';
import { Address, User } from '@prisma/client';
import { UpdateUserStatusDto } from './dto/update-status.dto';

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
            Documents: {
              orderBy: { updatedAt: 'desc' },
              include: {
                File: {
                  select: {
                    path: true,
                    filename: true,
                    mimetype: true,
                    size: true,
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

    const ownerAddress = user.Company?.Address ?? user.DeliveryMan?.Address;

    if (ownerAddress?.id) {
      const coordinates = await this.locationService.getAddressLocalization(
        this.prisma,
        ownerAddress.id,
      );

      ;(ownerAddress as Address & { localization: ILocalization }).localization =
        coordinates;
    }

    return user as unknown as User;
  }

  async updateStatus(id: number, body: UpdateUserStatusDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`usuario com codigo '${id}' não encontrado`);
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        status: body.status,
        ...(body.information !== undefined && {
          information: body.information,
        }),
      },
    });
  }
}
