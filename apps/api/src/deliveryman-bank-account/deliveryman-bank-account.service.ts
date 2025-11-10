import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DeliverymanBankAccount,
  Role,
  User,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliverymanBankAccountDto } from './dto/create-deliveryman-bank-account.dto';
import { DeliverymanBankAccountResponseDto } from './dto/deliveryman-bank-account-response.dto';
import { UpdateDeliverymanBankAccountDto } from './dto/update-deliveryman-bank-account.dto';

@Injectable()
export class DeliverymanBankAccountService {
  constructor(private prisma: PrismaService) {}

  async create(
    user: Pick<User, 'id' | 'role'>,
    dto: CreateDeliverymanBankAccountDto,
  ): Promise<DeliverymanBankAccountResponseDto> {
    const deliveryman = await this.ensureDeliveryman(user);

    const existingAccounts = await this.prisma.deliverymanBankAccount.count({
      where: { deliverymanId: deliveryman.id },
    });

    const shouldBeDefault = dto.isDefault ?? existingAccounts === 0;

    if (shouldBeDefault) {
      await this.prisma.deliverymanBankAccount.updateMany({
        where: { deliverymanId: deliveryman.id },
        data: { isDefault: false },
      });
    }

    const account = await this.prisma.deliverymanBankAccount.create({
      data: {
        deliverymanId: deliveryman.id,
        bankName: dto.bankName.trim(),
        bankCode: this.sanitizeString(dto.bankCode),
        agency: dto.agency.trim(),
        agencyDigit: this.sanitizeString(dto.agencyDigit),
        account: dto.account.trim(),
        accountDigit: this.sanitizeString(dto.accountDigit),
        accountType: dto.accountType,
        holderName: dto.holderName.trim(),
        cpf: this.onlyDigits(dto.cpf),
        pixKey: this.sanitizeString(dto.pixKey),
        pixKeyType: dto.pixKeyType,
        isDefault: shouldBeDefault,
      },
    });

    return this.toResponse(account);
  }

  async listMine(
    user: Pick<User, 'id' | 'role'>,
  ): Promise<DeliverymanBankAccountResponseDto[]> {
    const deliveryman = await this.ensureDeliveryman(user);

    const accounts = await this.prisma.deliverymanBankAccount.findMany({
      where: { deliverymanId: deliveryman.id },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return accounts.map((account) => this.toResponse(account));
  }

  async update(
    user: Pick<User, 'id' | 'role'>,
    accountId: number,
    dto: UpdateDeliverymanBankAccountDto,
  ): Promise<DeliverymanBankAccountResponseDto> {
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new BadRequestException('Identificador da conta inválido');
    }

    const deliveryman = await this.ensureDeliveryman(user);

    const existingAccount = await this.prisma.deliverymanBankAccount.findUnique({
      where: { id: accountId },
    });

    if (!existingAccount || existingAccount.deliverymanId !== deliveryman.id) {
      throw new NotFoundException('Conta bancária não encontrada');
    }

    if (dto.isDefault) {
      await this.prisma.deliverymanBankAccount.updateMany({
        where: {
          deliverymanId: deliveryman.id,
          NOT: { id: existingAccount.id },
        },
        data: { isDefault: false },
      });
    }

    const updatedAccount = await this.prisma.deliverymanBankAccount.update({
      where: { id: existingAccount.id },
      data: {
        ...(dto.bankName && { bankName: dto.bankName.trim() }),
        ...(dto.bankCode !== undefined && {
          bankCode: this.sanitizeString(dto.bankCode),
        }),
        ...(dto.agency && { agency: dto.agency.trim() }),
        ...(dto.agencyDigit !== undefined && {
          agencyDigit: this.sanitizeString(dto.agencyDigit),
        }),
        ...(dto.account && { account: dto.account.trim() }),
        ...(dto.accountDigit !== undefined && {
          accountDigit: this.sanitizeString(dto.accountDigit),
        }),
        ...(dto.accountType && { accountType: dto.accountType }),
        ...(dto.holderName && { holderName: dto.holderName.trim() }),
        ...(dto.cpf && { cpf: this.onlyDigits(dto.cpf) }),
        ...(dto.pixKey !== undefined && {
          pixKey: this.sanitizeString(dto.pixKey),
        }),
        ...(dto.pixKeyType !== undefined && { pixKeyType: dto.pixKeyType }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
      },
    });

    return this.toResponse(updatedAccount);
  }

  async listByDeliveryman(
    deliverymanId: number,
  ): Promise<DeliverymanBankAccountResponseDto[]> {
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

    const accounts = await this.prisma.deliverymanBankAccount.findMany({
      where: { deliverymanId },
      orderBy: { createdAt: 'desc' },
    });

    return accounts.map((account) => this.toResponse(account));
  }

  private async ensureDeliveryman(user: Pick<User, 'id' | 'role'>) {
    if (user.role !== Role.DELIVERY) {
      throw new ForbiddenException('Apenas entregadores podem acessar essa rota');
    }

    const deliveryman = await this.prisma.deliveryMan.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!deliveryman) {
      throw new NotFoundException('Entregador não encontrado');
    }

    return deliveryman;
  }

  private toResponse(
    account: DeliverymanBankAccount,
  ): DeliverymanBankAccountResponseDto {
    return {
      id: account.id,
      bankName: account.bankName,
      bankCode: account.bankCode,
      agency: account.agency,
      agencyDigit: account.agencyDigit,
      account: account.account,
      accountDigit: account.accountDigit,
      accountType: account.accountType,
      holderName: account.holderName,
      cpf: account.cpf,
      pixKey: account.pixKey,
      pixKeyType: account.pixKeyType,
      isDefault: account.isDefault,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  private sanitizeString(value?: string | null): string | null {
    if (value === undefined || value === null) {
      return value ?? null;
    }

    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  private onlyDigits(value: string): string {
    return value.replace(/\D/g, '');
  }
}
