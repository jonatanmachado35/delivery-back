import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileStorageService } from '../file-storage/file-storage.service';
import {
  DeliverymanDocumentStatus,
  Role,
  User,
} from '@prisma/client';
import { CreateDeliverymanDocumentDto } from './dto/create-deliveryman-document.dto';
import { DeliverymanDocumentResponseDto } from './dto/deliveryman-document-response.dto';

@Injectable()
export class DeliverymanDocumentService {
  constructor(
    private prisma: PrismaService,
    private fileStorage: FileStorageService,
  ) {}

  async uploadDocument(
    user: Pick<User, 'id' | 'role'>,
    dto: CreateDeliverymanDocumentDto,
    file?: Express.Multer.File,
  ): Promise<DeliverymanDocumentResponseDto> {
    if (user.role !== Role.DELIVERY) {
      throw new ForbiddenException('Apenas entregadores podem enviar documentos');
    }

    if (!file) {
      throw new BadRequestException('Arquivo do documento é obrigatório');
    }

    const deliveryman = await this.prisma.deliveryMan.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!deliveryman) {
      throw new NotFoundException('Entregador não encontrado');
    }

    const existingDocument = await this.prisma.deliverymanDocument.findFirst({
      where: {
        deliverymanId: deliveryman.id,
        type: dto.type,
      },
      include: {
        File: true,
      },
    });

    const fileRecord = await this.fileStorage.upsert(
      file,
      ['user', user.id.toString(), 'documents', dto.type],
      existingDocument?.File,
    );

    const documentNumber =
      this.optionalString(dto.documentNumber) ?? existingDocument?.documentNumber ?? '';
    const fullName = this.optionalString(dto.fullName) ?? existingDocument?.fullName ?? '';

    const requestedCpf = dto.cpf ?? existingDocument?.cpf ?? '';
    const cpf = this.onlyDigits(requestedCpf);

    if (dto.cpf && cpf.length && cpf.length !== 11) {
      throw new BadRequestException('CPF inválido');
    }
    const cnhType =
      dto.cnhType !== undefined
        ? this.optionalString(dto.cnhType)
        : existingDocument?.cnhType ?? null;

    const data = {
      description: dto.description ?? existingDocument?.description ?? '',
      documentNumber,
      fullName,
      cpf,
      cnhType,
      fileId: fileRecord.id,
      status: DeliverymanDocumentStatus.PENDING,
    };

    const document = existingDocument
      ? await this.prisma.deliverymanDocument.update({
          where: { id: existingDocument.id },
          data,
          include: { File: true },
        })
      : await this.prisma.deliverymanDocument.create({
          data: {
            ...data,
            deliverymanId: deliveryman.id,
            type: dto.type,
          },
          include: { File: true },
        });

    return this.toResponse(document);
  }

  async listMine(user: Pick<User, 'id' | 'role'>): Promise<DeliverymanDocumentResponseDto[]> {
    if (user.role !== Role.DELIVERY) {
      throw new ForbiddenException('Apenas entregadores podem consultar documentos próprios');
    }

    const deliveryman = await this.prisma.deliveryMan.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!deliveryman) {
      throw new NotFoundException('Entregador não encontrado');
    }

    const documents = await this.prisma.deliverymanDocument.findMany({
      where: { deliverymanId: deliveryman.id },
      orderBy: { updatedAt: 'desc' },
      include: { File: true },
    });

    return documents.map((doc) => this.toResponse(doc));
  }

  async listByDeliveryman(
    deliverymanId: number,
  ): Promise<DeliverymanDocumentResponseDto[]> {
    if (!Number.isInteger(deliverymanId) || deliverymanId <= 0) {
      throw new BadRequestException('Identificador do entregador inválido');
    }

    const deliveryman = await this.prisma.deliveryMan.findUnique({
      where: { id: deliverymanId },
      select: { id: true },
    });

    if (!deliveryman) {
      throw new NotFoundException('Entregador não encontrado');
    }

    const documents = await this.prisma.deliverymanDocument.findMany({
      where: { deliverymanId },
      orderBy: { updatedAt: 'desc' },
      include: { File: true },
    });

    return documents.map((doc) => this.toResponse(doc));
  }

  private toResponse(document: {
    id: number;
    type: string;
    description: string;
    documentNumber: string;
    fullName: string;
    cpf: string;
    cnhType: string | null;
    status: DeliverymanDocumentStatus;
    updatedAt: Date;
    File: {
      path: string;
      filename: string;
      mimetype: string;
      size: number;
    };
  }): DeliverymanDocumentResponseDto {
    return {
      id: document.id,
      type: document.type,
      description: document.description,
      documentNumber: document.documentNumber,
      fullName: document.fullName,
      cpf: document.cpf,
      cnhType: document.cnhType,
      status: document.status,
      fileUrl: document.File.path,
      fileName: document.File.filename,
      fileType: document.File.mimetype,
      fileSize: document.File.size,
      updatedAt: document.updatedAt,
    };
  }

  private optionalString(value?: string | null): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  private onlyDigits(value: string): string {
    return value.replace(/\D/g, '');
  }
}
