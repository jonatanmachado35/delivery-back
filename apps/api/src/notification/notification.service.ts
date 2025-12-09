import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  NotificationStatus,
  NotificationType,
  Role,
  User,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentSlipRequestDto } from './dto/payment-slip-request.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private prisma: PrismaService) {}

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

    await this.prisma.notification.createMany({
      data: admins.map((admin) => ({
        type: NotificationType.PAYMENT_SLIP_REQUEST,
        status: NotificationStatus.PENDING,
        message,
        referenceKey: billingKey,
        recipientId: admin.id,
        senderId: requester.id,
      })),
    });

    this.logger.log(
      `Solicitação de boleto registrada por user ${requester.id} para ${admins.length} admin(s)`,
    );
  }
}
