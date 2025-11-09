import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DeliverymanDocumentService } from './deliveryman-document.service';
import { Request } from 'express';
import { User } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateDeliverymanDocumentDto } from './dto/create-deliveryman-document.dto';
import { DeliverymanDocumentResponseDto } from './dto/deliveryman-document-response.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../admin/admin.guard';

@Controller('deliveryman/documents')
@ApiTags('Deliveryman Documents')
export class DeliverymanDocumentController {
  constructor(private deliverymanDocumentService: DeliverymanDocumentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Faz upload ou atualiza um documento do entregador' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        description: { type: 'string' },
        file: { type: 'string', format: 'binary' },
      },
      required: ['type', 'file'],
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: DeliverymanDocumentResponseDto })
  upload(
    @Body() body: CreateDeliverymanDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: User },
  ): Promise<DeliverymanDocumentResponseDto> {
    return this.deliverymanDocumentService.uploadDocument(req.user, body, file);
  }

  @Get('my')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lista documentos do próprio entregador logado' })
  @ApiResponse({ status: HttpStatus.OK, type: [DeliverymanDocumentResponseDto] })
  listMine(
    @Req() req: Request & { user: User },
  ): Promise<DeliverymanDocumentResponseDto[]> {
    return this.deliverymanDocumentService.listMine(req.user);
  }

  @Get('admin/:deliverymanId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Lista documentos de um entregador (admin)' })
  @ApiResponse({ status: HttpStatus.OK, type: [DeliverymanDocumentResponseDto] })
  listByDeliveryman(
    @Param('deliverymanId') deliverymanId: string,
  ): Promise<DeliverymanDocumentResponseDto[]> {
    return this.deliverymanDocumentService.listByDeliveryman(+deliverymanId);
  }
}
