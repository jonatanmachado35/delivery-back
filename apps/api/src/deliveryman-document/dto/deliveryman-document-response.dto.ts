import { ApiProperty } from '@nestjs/swagger';
import { DeliverymanDocumentStatus } from '@prisma/client';

export class DeliverymanDocumentResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ description: 'Tipo do documento' })
  type: string;

  @ApiProperty({ description: 'Número do documento (RG/CNH)' })
  documentNumber: string;

  @ApiProperty({ description: 'Nome completo do titular' })
  fullName: string;

  @ApiProperty({ description: 'CPF do titular' })
  cpf: string;

  @ApiProperty({ description: 'Tipo/categoria da CNH', required: false })
  cnhType?: string | null;

  @ApiProperty({ description: 'Descrição informada pelo entregador', required: false })
  description: string;

  @ApiProperty({ enum: DeliverymanDocumentStatus })
  status: DeliverymanDocumentStatus;

  @ApiProperty({ description: 'URL do arquivo' })
  fileUrl: string;

  @ApiProperty({ description: 'Nome do arquivo original' })
  fileName: string;

  @ApiProperty({ description: 'Tipo MIME do arquivo' })
  fileType: string;

  @ApiProperty({ description: 'Tamanho do arquivo em bytes' })
  fileSize: number;

  @ApiProperty({ description: 'Data da última atualização' })
  updatedAt: Date;
}
