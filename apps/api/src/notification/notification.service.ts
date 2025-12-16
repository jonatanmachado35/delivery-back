import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  Notification,
  NotificationActionStatus,
  NotificationStatus,
  NotificationType,
  Prisma,
  Role,
  User,
  UserStatus,
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
import { PaymentSlipRequestDto } from './dto/payment-slip-request.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private prisma: PrismaService) { }

  async list(
    user: Pick<User, 'id'>,
    query: NotificationQueryDto,
  ): Promise<NotificationPaginateResponse> {
    const page = Math.max(query.page ?? 1, 1);
    const limit = Math.max(query.limit ?? 10, 1);

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { recipientId: user.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              role: true,
              Company: {
                select: {
                  name: true,
                  cnpj: true,
                  phone: true,
                },
              },
              DeliveryMan: {
                select: {
                  name: true,
                  cpf: true,
                  phone: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.notification.count({
        where: { recipientId: user.id },
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
        recipientId: user.id,
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
      data: { readAt: new Date(), status: NotificationStatus.READ },
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
        status: NotificationStatus.READ,
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
        status: NotificationStatus.READ,
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
        status: NotificationStatus.PENDING,
        requiresAction,
        actionStatus: requiresAction
          ? NotificationActionStatus.PENDING
          : NotificationActionStatus.APPROVED,
        metadata: (dto.metadata as Prisma.InputJsonValue) ?? undefined,
        link: dto.link ?? undefined,
        recipientId,
        senderId: user.id,
      },
    });

    return this.toResponse(notification);
  }

  async requestPaymentSlip(
    body: PaymentSlipRequestDto,
    requester: Pick<User, 'id' | 'role'>,
  ): Promise<void> {
    if (requester.role !== Role.COMPANY) {
      throw new UnauthorizedException(
        'Somente lojistas podem solicitar boleto ao administrador.',
      );
    }

    const admins = await this.prisma.user.findMany({
      where: { role: Role.ADMIN, status: UserStatus.ACTIVE },
      select: { id: true },
    });

    if (!admins.length) {
      throw new NotFoundException(
        'Nenhum administrador ativo disponível para receber notificações.',
      );
    }

    const billingKey = body.billingKey?.trim() || undefined;

    if (billingKey) {
      const billing = await this.prisma.billing.findFirst({
        where: { key: billingKey, userId: requester.id },
        select: { id: true },
      });

      if (!billing) {
        throw new NotFoundException(
          'Fatura não encontrada para esse usuário ou chave.',
        );
      }
    }

    const message =
      body.message?.trim() ||
      'Solicitação de boleto para pagamento enviada pela loja.';
    const title = 'Solicitação de boleto';

    await this.prisma.notification.createMany({
      data: admins.map((admin) => ({
        type: NotificationType.PAYMENT_SLIP_REQUEST,
        status: NotificationStatus.PENDING,
        requiresAction: true,
        actionStatus: NotificationActionStatus.PENDING,
        message,
        title,
        referenceKey: billingKey,
        recipientId: admin.id,
        senderId: requester.id,
      })),
    });

    this.logger.log(
      `Solicitação de boleto registrada por user ${requester.id} para ${admins.length} admin(s)`,
    );
  }

  private async findOwned(id: number, userId: number): Promise<Notification> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('Identificador da notificação é inválido');
    }

    const notification = await this.prisma.notification.findFirst({
      where: { id, recipientId: userId },
    });

    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    return notification;
  }

  private toResponse(notification: any): NotificationDto {
    return {
      id: notification.id,
      title: notification.title ?? 'Notificação',
      message: notification.message,
      type: notification.type,
      actionStatus: notification.actionStatus,
      requiresAction: notification.requiresAction,
      isRead: Boolean(notification.readAt),
      readAt: notification.readAt,
      createdAt: notification.createdAt,
      link: notification.link,
      metadata: (notification.metadata as Record<string, unknown>) ?? null,
      senderData: notification.sender
        ? {
          id: notification.sender.id,
          email: notification.sender.email,
          role: notification.sender.role,
          company: notification.sender.Company
            ? {
              name: notification.sender.Company.name,
              cnpj: notification.sender.Company.cnpj,
              phone: notification.sender.Company.phone,
            }
            : undefined,
          deliveryMan: notification.sender.DeliveryMan
            ? {
              name: notification.sender.DeliveryMan.name,
              cpf: notification.sender.DeliveryMan.cpf,
              phone: notification.sender.DeliveryMan.phone,
            }
            : undefined,
        }
        : null,
    };
  }
}
