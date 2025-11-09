import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDeliverymanDocumentDto {
  @ApiProperty({ description: 'Tipo do documento (ex: CNH_frente, CNH_verso, Selfie)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type: string;

  @ApiPropertyOptional({ description: 'Descrição opcional do documento' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
