import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DeliverymanBankAccount,
  DeliverymanBankAccountType,
  PixKeyType,
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

    const normalizedData = this.normalizeBankAccountData(dto);

    const account = await this.prisma.deliverymanBankAccount.create({
      data: {
        deliverymanId: deliveryman.id,
        ...normalizedData,
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

    const normalizedData = this.normalizeBankAccountData(
      dto,
      existingAccount,
    );

    const updatedAccount = await this.prisma.deliverymanBankAccount.update({
      where: { id: existingAccount.id },
      data: {
        ...normalizedData,
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

  private normalizeBankAccountData(
    dto: Partial<CreateDeliverymanBankAccountDto>,
    current?: DeliverymanBankAccount,
  ) {
    const bankName =
      dto.bankName !== undefined
        ? this.sanitizeString(dto.bankName)
        : current?.bankName ?? null;
    const bankCode =
      dto.bankCode !== undefined
        ? this.sanitizeString(dto.bankCode)
        : current?.bankCode ?? null;
    const agency =
      dto.agency !== undefined
        ? this.sanitizeString(dto.agency)
        : current?.agency ?? null;
    const agencyDigit =
      dto.agencyDigit !== undefined
        ? this.sanitizeString(dto.agencyDigit)
        : current?.agencyDigit ?? null;
    const account =
      dto.account !== undefined
        ? this.sanitizeString(dto.account)
        : current?.account ?? null;
    const accountDigit =
      dto.accountDigit !== undefined
        ? this.sanitizeString(dto.accountDigit)
        : current?.accountDigit ?? null;
    const accountType: DeliverymanBankAccountType | null =
      dto.accountType !== undefined
        ? dto.accountType
        : current?.accountType ?? null;
    const holderName =
      dto.holderName !== undefined
        ? this.sanitizeString(dto.holderName)
        : current?.holderName ?? null;
    const cpfDigits =
      dto.cpf !== undefined
        ? this.onlyDigits(dto.cpf)
        : current?.cpf ?? null;
    const cpf = cpfDigits && cpfDigits.length ? cpfDigits : null;

    const pixKey =
      dto.pixKey !== undefined
        ? this.sanitizeString(dto.pixKey)
        : current?.pixKey ?? null;
    const pixKeyType: PixKeyType | null =
      dto.pixKeyType !== undefined
        ? dto.pixKeyType
        : current?.pixKeyType ?? null;

    if (pixKey && !pixKeyType) {
      throw new BadRequestException('Informe o tipo da chave PIX');
    }

    if (pixKeyType && !pixKey) {
      throw new BadRequestException('Informe o valor da chave PIX');
    }

    if (cpf && cpf.length !== 11) {
      throw new BadRequestException('CPF inválido');
    }

    const hasPix = Boolean(pixKey && pixKeyType);
    const hasBank = Boolean(
      bankName &&
        agency &&
        account &&
        accountType &&
        holderName &&
        cpf,
    );

    if (!hasPix && !hasBank) {
      throw new BadRequestException(
        'Informe os dados bancários completos ou uma chave PIX.',
      );
    }

    return {
      bankName,
      bankCode,
      agency,
      agencyDigit,
      account,
      accountDigit,
      accountType,
      holderName,
      cpf,
      pixKey,
      pixKeyType,
    };
  }
}
