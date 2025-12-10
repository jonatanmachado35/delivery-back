import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class NotificationCreateDto {
  @ApiProperty({
    description: 'Título da notificação',
    example: 'Novo pedido recebido',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Mensagem/descrição da notificação',
    example: 'O pedido #123 foi criado e precisa ser analisado',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Categoria da notificação',
    enum: NotificationType,
    required: false,
    default: NotificationType.INFO,
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiProperty({
    description: 'Define se o usuário precisa aprovar/rejeitar',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requiresAction?: boolean;

  @ApiProperty({
    description: 'Metadados livres relacionados à notificação',
    required: false,
    type: Object,
  })
  @IsOptional()
  metadata?: Record<string, unknown>;

  @ApiProperty({
    description: 'Link opcional para ação/contexto no front',
    required: false,
    example: '/deliveries/123',
  })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiProperty({
    description: 'Destinatário. Se omitido, usa o usuário autenticado',
    required: false,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId?: number;
}
