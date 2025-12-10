import { ApiProperty } from '@nestjs/swagger';
import {
  NotificationActionStatus,
  NotificationType,
} from '@prisma/client';
import { Pagination } from '../../paginate/entity/pagination';

export class NotificationDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: 'Novo pedido aguardando aprovação',
    description: 'Título curto e direto da notificação',
  })
  title: string;

  @ApiProperty({
    example: 'O pedido #123 precisa de aprovação',
    description: 'Mensagem detalhada da notificação',
  })
  message: string;

  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.INFO,
  })
  type: NotificationType;

  @ApiProperty({
    enum: NotificationActionStatus,
    example: NotificationActionStatus.PENDING,
  })
  actionStatus: NotificationActionStatus;

  @ApiProperty({
    description: 'Indica se a notificação exige ação do usuário (aprovar/rejeitar)',
    example: true,
  })
  requiresAction: boolean;

  @ApiProperty({
    description: 'True se já foi lida',
    example: false,
  })
  isRead: boolean;

  @ApiProperty({
    description: 'Data de leitura quando aplicável',
    nullable: true,
    example: null,
  })
  readAt?: Date | null;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-03-01T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Link opcional para ação/contexto',
    nullable: true,
    example: '/deliveries/123',
    required: false,
  })
  link?: string | null;

  @ApiProperty({
    description: 'Payload adicional enviado junto à notificação',
    required: false,
    nullable: true,
    type: Object,
  })
  metadata?: Record<string, unknown> | null;
}

export class NotificationPaginateResponse extends Pagination<NotificationDto> {
  @ApiProperty({
    description: 'Lista de notificações',
    type: [NotificationDto],
  })
  data: NotificationDto[];

  @ApiProperty({
    description: 'Alias para a página atual (compatibilidade com o front)',
    example: 1,
    required: false,
  })
  page?: number;

  @ApiProperty({
    description: 'Alias para itens por página (compatibilidade com o front)',
    example: 10,
    required: false,
  })
  limit?: number;

  @ApiProperty({
    description: 'Alias para total de páginas (compatibilidade com o front)',
    example: 5,
    required: false,
  })
  totalPages?: number;
}

export class UnreadCountResponseDto {
  @ApiProperty({
    description: 'Quantidade total de notificações não lidas',
    example: 3,
  })
  total: number;
}
