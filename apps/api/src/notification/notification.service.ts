import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Notification,
  NotificationActionStatus,
  NotificationType,
  Prisma,
  Role,
  User,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginateResponse } from '../utils/fn';
import { NotificationCreateDto } from './dto/notification-create.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import {
  NotificationDto,
  NotificationPaginateResponse,
  UnreadCountResponseDto,
} from './dto/notification-response.dto';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async list(
    user: Pick<User, 'id'>,
    query: NotificationQueryDto,
  ): Promise<NotificationPaginateResponse> {
    const page = Math.max(query.page ?? 1, 1);
    const limit = Math.max(query.limit ?? 10, 1);

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({
        where: { userId: user.id },
      }),
    ]);

    const mapped = notifications.map((notification) =>
      this.toResponse(notification),
    );

    const pagination = paginateResponse(
      mapped,
      page,
      limit,
      total,
    ) as NotificationPaginateResponse;

    return {
      ...pagination,
      page,
      limit,
      totalPages: pagination.totalPage,
    };
  }

  async unreadCount(user: Pick<User, 'id'>): Promise<UnreadCountResponseDto> {
    const total = await this.prisma.notification.count({
      where: {
        userId: user.id,
        readAt: null,
      },
    });

    return { total };
  }

  async markAsRead(
    id: number,
    user: Pick<User, 'id'>,
  ): Promise<NotificationDto> {
    const notification = await this.findOwned(id, user.id);

    if (notification.readAt) {
      return this.toResponse(notification);
    }

    const updated = await this.prisma.notification.update({
      where: { id: notification.id },
      data: { readAt: new Date() },
    });

    return this.toResponse(updated);
  }

  async approve(
    id: number,
    user: Pick<User, 'id'>,
  ): Promise<NotificationDto> {
    const notification = await this.findOwned(id, user.id);

    if (!notification.requiresAction) {
      throw new BadRequestException('Essa notificação não exige aprovação');
    }

    if (notification.actionStatus !== NotificationActionStatus.PENDING) {
      throw new BadRequestException('Ação já concluída para esta notificação');
    }

    const updated = await this.prisma.notification.update({
      where: { id: notification.id },
      data: {
        actionStatus: NotificationActionStatus.APPROVED,
        actionAt: new Date(),
        readAt: notification.readAt ?? new Date(),
      },
    });

    return this.toResponse(updated);
  }

  async reject(
    id: number,
    user: Pick<User, 'id'>,
  ): Promise<NotificationDto> {
    const notification = await this.findOwned(id, user.id);

    if (!notification.requiresAction) {
      throw new BadRequestException('Essa notificação não exige aprovação');
    }

    if (notification.actionStatus !== NotificationActionStatus.PENDING) {
      throw new BadRequestException('Ação já concluída para esta notificação');
    }

    const updated = await this.prisma.notification.update({
      where: { id: notification.id },
      data: {
        actionStatus: NotificationActionStatus.REJECTED,
        actionAt: new Date(),
        readAt: notification.readAt ?? new Date(),
      },
    });

    return this.toResponse(updated);
  }

  async create(
    dto: NotificationCreateDto,
    user: Pick<User, 'id' | 'role'>,
  ): Promise<NotificationDto> {
    const requiresAction = dto.requiresAction ?? false;
    const recipientId = dto.userId ?? user.id;

    if (dto.userId && dto.userId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Apenas administradores podem enviar notificações para outros usuários',
      );
    }

    const notification = await this.prisma.notification.create({
      data: {
        title: dto.title,
        message: dto.message,
        type: dto.type ?? NotificationType.INFO,
        requiresAction,
        actionStatus: requiresAction
          ? NotificationActionStatus.PENDING
          : NotificationActionStatus.APPROVED,
        metadata: (dto.metadata as Prisma.InputJsonValue) ?? undefined,
        link: dto.link ?? undefined,
        userId: recipientId,
      },
    });

    return this.toResponse(notification);
  }

  private async findOwned(
    id: number,
    userId: number,
  ): Promise<Notification> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('Identificador da notificação é inválido');
    }

    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    return notification;
  }

  private toResponse(notification: Notification): NotificationDto {
    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      actionStatus: notification.actionStatus,
      requiresAction: notification.requiresAction,
      isRead: Boolean(notification.readAt),
      readAt: notification.readAt,
      createdAt: notification.createdAt,
      link: notification.link,
      metadata: (notification.metadata as Record<string, unknown>) ?? null,
    };
  }
}
