import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DeliveryStatus, Prisma, Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DeliverymanStatsResponseDto } from './dto/deliveryman-stats-response.dto';

@Injectable()
export class DeliverymanService {
  constructor(private prisma: PrismaService) {}

  async getStats(
    deliverymanParamId: number,
    requester: Pick<User, 'id' | 'role'>,
  ): Promise<DeliverymanStatsResponseDto> {
    if (!Number.isInteger(deliverymanParamId) || deliverymanParamId <= 0) {
      throw new BadRequestException('Identificador do entregador inválido');
    }

    const deliveryman = await this.prisma.deliveryMan.findFirst({
      where: {
        OR: [
          { userId: deliverymanParamId },
          { id: deliverymanParamId },
        ],
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!deliveryman) {
      throw new NotFoundException('Entregador não encontrado');
    }

    if (requester.role !== Role.ADMIN && requester.id !== deliveryman.userId) {
      throw new ForbiddenException('Acesso negado');
    }

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 6);

    const startOfMonth = new Date(startOfToday);
    startOfMonth.setDate(1);

    const balancePromise = this.prisma.balance.findFirst({
      where: {
        User: {
          some: {
            id: deliveryman.userId,
          },
        },
      },
      select: {
        amount: true,
      },
    });

    const [
      pendingDeliveries,
      completedToday,
      totalDeliveries,
      todayEarnings,
      weekEarnings,
      monthEarnings,
      averageDeliveryTime,
      balance,
    ] = await Promise.all([
      this.prisma.delivery.count({
        where: {
          deliveryManId: deliveryman.id,
          status: {
            in: [DeliveryStatus.PENDING, DeliveryStatus.IN_PROGRESS],
          },
        },
      }),
      this.prisma.delivery.count({
        where: {
          deliveryManId: deliveryman.id,
          status: DeliveryStatus.COMPLETED,
          completedAt: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
      }),
      this.prisma.delivery.count({
        where: {
          deliveryManId: deliveryman.id,
        },
      }),
      this.sumCompletedAmount(deliveryman.id, startOfToday, endOfToday),
      this.sumCompletedAmount(deliveryman.id, startOfWeek, endOfToday),
      this.sumCompletedAmount(deliveryman.id, startOfMonth, endOfToday),
      this.calculateAverageDeliveryTime(deliveryman.id),
      balancePromise,
    ]);

    const available = this.toNumber(balance?.amount);

    return {
      deliveries: {
        pending: pendingDeliveries,
        completed: completedToday,
        total: totalDeliveries,
      },
      earnings: {
        today: todayEarnings,
        week: weekEarnings,
        month: monthEarnings,
        goal: 0,
      },
      performance: {
        averageDeliveryTime,
        rating: 0,
      },
      balance: {
        available,
        pending: 0,
      },
    };
  }

  private async sumCompletedAmount(
    deliverymanId: number,
    start: Date,
    end: Date,
  ): Promise<number> {
    const aggregate = await this.prisma.delivery.aggregate({
      where: {
        deliveryManId: deliverymanId,
        status: DeliveryStatus.COMPLETED,
        completedAt: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        price: true,
      },
    });

    return this.toNumber(aggregate._sum.price);
  }

  private async calculateAverageDeliveryTime(
    deliverymanId: number,
  ): Promise<number> {
    const result =
      await this.prisma.$queryRaw<{ avg_seconds: number | string | null }[]>`
        SELECT AVG(EXTRACT(EPOCH FROM ("completedAt" - "createdAt"))) AS avg_seconds
        FROM "deliveries"
        WHERE "deliveryManId" = ${deliverymanId}
          AND "status" = 'COMPLETED'
          AND "completedAt" IS NOT NULL
      `;

    const avgSeconds = result?.[0]?.avg_seconds;

    if (avgSeconds === null || avgSeconds === undefined) {
      return 0;
    }

    const seconds =
      typeof avgSeconds === 'number' ? avgSeconds : Number(avgSeconds);

    if (!Number.isFinite(seconds)) {
      return 0;
    }

    return this.round(seconds / 60);
  }

  private toNumber(value?: Prisma.Decimal | number | null): number {
    if (value === null || value === undefined) {
      return 0;
    }

    if (typeof value === 'number') {
      return this.round(value);
    }

    const decimal = value as unknown as { toNumber?: () => number };

    if (decimal?.toNumber) {
      return this.round(decimal.toNumber());
    }

    const numeric = Number(value);

    if (!Number.isFinite(numeric)) {
      return 0;
    }

    return this.round(numeric);
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
