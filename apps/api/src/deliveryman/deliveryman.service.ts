import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DeliveryStatus,
  ExtractType,
  Prisma,
  Role,
  User,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DeliverymanStatsResponseDto } from './dto/deliveryman-stats-response.dto';
import { DeliverymanReportsResponseDto } from './dto/deliveryman-reports-response.dto';
import { DeliverymanBalanceResponseDto } from './dto/deliveryman-balance-response.dto';

@Injectable()
export class DeliverymanService {
  constructor(private prisma: PrismaService) {}

  async getStats(
    deliverymanParamId: number,
    requester: Pick<User, 'id' | 'role'>,
  ): Promise<DeliverymanStatsResponseDto> {
    const deliveryman = await this.ensureAccess(deliverymanParamId, requester);

    const [
      totalDeliveries,
      completedDeliveries,
      pendingDeliveries,
      cancelledDeliveries,
      totalEarnings,
      monthlyStats,
      balance,
    ] =
      await Promise.all([
        this.prisma.delivery.count({
          where: { deliveryManId: deliveryman.id },
        }),
        this.prisma.delivery.count({
          where: {
            deliveryManId: deliveryman.id,
            status: DeliveryStatus.COMPLETED,
          },
        }),
        this.prisma.delivery.count({
          where: {
            deliveryManId: deliveryman.id,
            status: { in: [DeliveryStatus.PENDING, DeliveryStatus.IN_PROGRESS] },
          },
        }),
        this.prisma.delivery.count({
          where: {
            deliveryManId: deliveryman.id,
            status: DeliveryStatus.CANCELED,
          },
        }),
        this.sumCompletedAmount(deliveryman.id),
        this.getMonthlyStats(deliveryman.id),
        this.prisma.balance.findFirst({
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
        }),
      ]);

    return {
      totalDeliveries,
      completedDeliveries,
      pendingDeliveries,
      cancelledDeliveries,
      totalEarnings,
      currentBalance: this.toNumber(balance?.amount),
      averageRating: 0,
      monthlyStats,
    };
  }

  async getReports(
    deliverymanParamId: number,
    requester: Pick<User, 'id' | 'role'>,
    startDate?: string,
    endDate?: string,
  ): Promise<DeliverymanReportsResponseDto> {
    const deliveryman = await this.ensureAccess(deliverymanParamId, requester);

    const { start, end } = this.resolveDateRange(startDate, endDate);

    const deliveries = await this.prisma.delivery.findMany({
      where: {
        deliveryManId: deliveryman.id,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
        code: true,
        status: true,
        price: true,
        information: true,
        createdAt: true,
        completedAt: true,
        ClientAddress: {
          select: {
            street: true,
            number: true,
            city: true,
            state: true,
            zipCode: true,
            complement: true,
          },
        },
        Company: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const weekTemplate = this.buildEmptyWeeklyStats();

    let totalEarnings = 0;
    let totalDeliveries = 0;
    let completedDeliveries = 0;
    let pendingDeliveries = 0;

    const mappedDeliveries = deliveries.map((delivery) => {
      const dayKey = this.getDayKey(delivery.createdAt);
      const normalizedStatus = this.normalizeStatus(delivery.status);
      const value = this.toNumber(delivery.price);

      totalDeliveries += 1;
      if (normalizedStatus === 'completed') {
        completedDeliveries += 1;
        totalEarnings += value;
      } else {
        pendingDeliveries += 1;
      }

      const daily = weekTemplate[dayKey];
      const bucketIndex = this.getHourBucket(delivery.createdAt);
      daily.hourlyData[bucketIndex] += 1;
      daily.totalDeliveries += 1;
      if (normalizedStatus === 'completed') {
        daily.completedDeliveries += 1;
      } else {
        daily.pendingDeliveries += 1;
      }

      return {
        id: String(delivery.id),
        code: delivery.code,
        status: normalizedStatus,
        day: dayKey,
        customerName: delivery.Company?.name ?? 'Cliente',
        address: this.buildAddress(delivery.ClientAddress),
        value,
        createdAt: delivery.createdAt.toISOString(),
        deliveredAt: delivery.completedAt?.toISOString(),
        description: delivery.information,
        date: delivery.createdAt.toISOString(),
      };
    });

    return {
      weeklyStats: weekTemplate,
      summary: {
        totalDeliveries,
        completedDeliveries,
        pendingDeliveries,
        totalEarnings: this.round(totalEarnings),
      },
      deliveries: mappedDeliveries,
    };
  }

  async getBalance(
    deliverymanParamId: number,
    requester: Pick<User, 'id' | 'role'>,
  ): Promise<DeliverymanBalanceResponseDto> {
    const deliveryman = await this.ensureAccess(deliverymanParamId, requester);

    const [balance, totalEarnedAgg, totalWithdrawnAgg, extracts] =
      await Promise.all([
        this.prisma.balance.findFirst({
          where: {
            User: {
              some: { id: deliveryman.userId },
            },
          },
          select: { amount: true },
        }),
        this.prisma.delivery.aggregate({
          where: {
            deliveryManId: deliveryman.id,
            status: DeliveryStatus.COMPLETED,
          },
          _sum: { price: true },
        }),
        this.prisma.extract.aggregate({
          where: {
            userId: deliveryman.userId,
            type: { in: [ExtractType.WITHDRAW, ExtractType.DEBIT] },
          },
          _sum: { amount: true },
        }),
        this.prisma.extract.findMany({
          where: { userId: deliveryman.userId },
          orderBy: { createdAt: 'desc' },
          take: 20,
        }),
      ]);

    const totalEarned = this.toNumber(totalEarnedAgg._sum.price);
    const totalWithdrawn = this.toNumber(totalWithdrawnAgg._sum.amount);

    const transactions = extracts.map((item) => ({
      id: item.id,
      type: this.mapExtractType(item.type),
      amount: this.toNumber(item.amount),
      description: '',
      status: 'completed',
      pixKey: undefined,
      createdAt: item.createdAt.toISOString(),
    }));

    return {
      currentBalance: this.toNumber(balance?.amount),
      totalEarned,
      totalWithdrawn,
      pendingBalance: 0,
      transactions,
    };
  }

  private async ensureAccess(
    deliverymanParamId: number,
    requester: Pick<User, 'id' | 'role'>,
  ): Promise<{ id: number; userId: number }> {
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

    return deliveryman;
  }

  private async sumCompletedAmount(
    deliverymanId: number,
    start?: Date,
    end?: Date,
  ): Promise<number> {
    const aggregate = await this.prisma.delivery.aggregate({
      where: {
        deliveryManId: deliverymanId,
        status: DeliveryStatus.COMPLETED,
        ...(start &&
          end && {
            completedAt: {
              gte: start,
              lte: end,
            },
          }),
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

  private async getMonthlyStats(
    deliverymanId: number,
  ): Promise<DeliverymanStatsResponseDto['monthlyStats']> {
    const rows =
      await this.prisma.$queryRaw<
        { month: string; deliveries: number; earnings: number }[]
      >`
        SELECT
          TO_CHAR(date_trunc('month', "createdAt"), 'YYYY-MM') AS month,
          COUNT(*)::int AS deliveries,
          COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN price ELSE 0 END), 0)::float AS earnings
        FROM "deliveries"
        WHERE "deliveryManId" = ${deliverymanId}
        GROUP BY 1
        ORDER BY 1 DESC
        LIMIT 3
      `;

    return rows
      .map((row) => ({
        month: row.month,
        deliveries: Number(row.deliveries) || 0,
        earnings: this.round(Number(row.earnings) || 0),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private buildEmptyWeeklyStats(): DeliverymanReportsResponseDto['weeklyStats'] {
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ] as const;

    return days.reduce(
      (acc, day) => {
        acc[day] = {
          dayOfWeek: day,
          hourlyData: [0, 0, 0, 0, 0, 0],
          totalDeliveries: 0,
          completedDeliveries: 0,
          pendingDeliveries: 0,
        };
        return acc;
      },
      {} as DeliverymanReportsResponseDto['weeklyStats'],
    );
  }

  private getDayKey(date: Date): keyof DeliverymanReportsResponseDto['weeklyStats'] {
    const index = date.getDay();
    const keys = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ] as const;
    return keys[index];
  }

  private getHourBucket(date: Date): number {
    const hour = date.getHours();
    return Math.min(5, Math.floor(hour / 4));
  }

  private normalizeStatus(
    status: DeliveryStatus,
  ): 'completed' | 'pending' | 'in_progress' {
    switch (status) {
      case DeliveryStatus.COMPLETED:
        return 'completed';
      case DeliveryStatus.IN_PROGRESS:
        return 'in_progress';
      default:
        return 'pending';
    }
  }

  private mapExtractType(type: ExtractType): 'earning' | 'withdrawal' {
    if ([ExtractType.DEPOSIT, ExtractType.CREDIT].includes(type)) {
      return 'earning';
    }

    return 'withdrawal';
  }

  private buildAddress(address: {
    street: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
    complement: string | null;
  }): string {
    const complement = address.complement?.trim();
    const complementText = complement ? ` (${complement})` : '';
    return `${address.street}, ${address.number}, ${address.city} - ${address.state} - ${address.zipCode}${complementText}`;
  }

  private getStartOfWeek(date: Date): Date {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    return start;
  }

  private getEndOfWeek(startOfWeek: Date): Date {
    const end = new Date(startOfWeek);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  private resolveDateRange(startDate?: string, endDate?: string): {
    start: Date;
    end: Date;
  } {
    const now = new Date();
    let start: Date;
    let end: Date;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      start = this.getStartOfWeek(now);
      end = this.getEndOfWeek(start);
    }

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Período inválido');
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
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
