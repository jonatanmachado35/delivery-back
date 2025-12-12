import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyDto } from './dto/company.dto';
import { LocationService } from '../location/location.service';
import type { SignOptions } from 'jsonwebtoken';
import {
  Company,
  DeliveryMan,
  Prisma,
  Role,
  User,
  UserStatus,
} from '@prisma/client';
import { DeliverymanDto } from './dto/deliverymen.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private locationService: LocationService,
  ) {}

  private getRefreshJwtConfig(): {
    secret: string;
    expiresIn?: SignOptions['expiresIn'];
  } {
    const secret =
      process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT refresh secret is not configured');
    }

    const expiresIn = process.env.JWT_REFRESH_EXPIRATION
      ? (process.env.JWT_REFRESH_EXPIRATION as SignOptions['expiresIn'])
      : ('30d' as SignOptions['expiresIn']);

    return {
      secret,
      expiresIn,
    };
  }

  private async signAccessToken(userId: number): Promise<string> {
    return this.jwtService.signAsync({ id: userId });
  }

  private async signRefreshToken(userId: number): Promise<string> {
    const { secret, expiresIn } = this.getRefreshJwtConfig();
    return this.jwtService.signAsync(
      { id: userId, tokenType: 'refresh' },
      { secret, expiresIn },
    );
  }

  private async generateTokens(userId: number): Promise<{
    token: string;
    refreshToken: string;
  }> {
    return {
      token: await this.signAccessToken(userId),
      refreshToken: await this.signRefreshToken(userId),
    };
  }

  async signupCompany(company: CompanyDto): Promise<void> {
    const salt = await bcrypt.genSalt(12);

    const hashedPassword = await bcrypt.hash(company.password, salt);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: company.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    const existingCnpj = await this.prisma.user.findFirst({
      where: { Company: { cnpj: company.cnpj } },
    });

    if (existingCnpj) {
      throw new ConflictException('CNPj já cadastrado');
    }

    const localization = await this.locationService.reverse(
      company.city,
      company.state,
      company.address,
      company.number,
      company.zipCode,
    );

    const [address] = await this.prisma.$queryRawUnsafe<
      { id: number; localization: string }[]
    >(
      `
      INSERT INTO "addresses" (city, state, street, number, "zipCode", localization)
      VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326))
      RETURNING id
      `,
      company.city,
      company.state,
      company.address,
      company.number,
      company.zipCode,
      localization.longitude,
      localization.latitude,
    );

    const idAddress = address?.id;

    await this.prisma.user.create({
      data: {
        email: company.email,
        password: hashedPassword,
        role: Role.COMPANY,
        status: UserStatus.BLOCKED,
        information: 'cadastro precisa ser desbloqueado',
        Company: {
          create: {
            name: company.name,
            cnpj: company.cnpj,
            phone: company.phone,
            idAddress: idAddress,
          },
        },
        Balance: {
          create: {
            amount: 0,
          },
        },
      },
    });
  }

  async signupDeliveryman(deliveryman: DeliverymanDto): Promise<void> {
    return this.prisma.$transaction(async (tx) => {
      const vehicleType = await tx.vehicleType.findFirst({
        where: { type: deliveryman.vehicleType },
        select: { id: true, type: true },
      });

      if (!vehicleType?.id) {
        throw new NotFoundException('Tipo de veículo não encontrado');
      }

      const vehicleTypeId = vehicleType.id;
      const normalizedVehicleType = (vehicleType.type ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
      const isBike = normalizedVehicleType === 'bike';
      const initialStatus = UserStatus.NO_DOCUMENTS as UserStatus;
      const initialInformation = `
          ### Sistema
          - Aguardando documentos
          - Aguardando desbloqueio`;

      const cleanLicensePlate = deliveryman.licensePlate
        ? deliveryman.licensePlate.trim().toUpperCase()
        : undefined;

      if (cleanLicensePlate) {
        const existingVehicle = await tx.vehicle.findUnique({
          where: { licensePlate: cleanLicensePlate },
          select: { id: true },
        });

        if (existingVehicle) {
          throw new ConflictException('Placa já cadastrada');
        }
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(deliveryman.password, salt);

      const existingUser = await tx.user.findUnique({
        where: { email: deliveryman.email },
      });

      if (existingUser) {
        throw new ConflictException('Email já cadastrado');
      }

      const existingCpf = await tx.deliveryMan.findUnique({
        where: { cpf: deliveryman.cpf },
        select: { id: true },
      });

      if (existingCpf) {
        throw new ConflictException('CPF já cadastrado');
      }

      const localization = await this.locationService.reverse(
        deliveryman.city,
        deliveryman.state,
        deliveryman.address,
        deliveryman.number,
        deliveryman.zipCode,
      );

      const [address] = await tx.$queryRawUnsafe<
        { id: number; localization: string }[]
      >(
        `
      INSERT INTO "addresses" (city, state, street, number, "zipCode", localization)
      VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326))
      RETURNING id
      `,
        deliveryman.city,
        deliveryman.state,
        deliveryman.address,
        deliveryman.number,
        deliveryman.zipCode,
        localization.longitude,
        localization.latitude,
      );

      const idAddress = address?.id;

      const sanitizeField = (value?: string): string | undefined => {
        if (!value) {
          return undefined;
        }

        const trimmed = value.trim();
        return trimmed.length ? trimmed : undefined;
      };

      const licensePlate =
        cleanLicensePlate ?? (isBike ? await this.generateBikePlate(tx) : undefined);
      const brand =
        sanitizeField(deliveryman.brand) ?? (isBike ? 'Bike' : undefined);
      const model =
        sanitizeField(deliveryman.model) ?? (isBike ? 'Bike' : undefined);
      const year =
        sanitizeField(deliveryman.year) ??
        (isBike ? new Date().getFullYear().toString() : undefined);
      const color =
        sanitizeField(deliveryman.color) ?? (isBike ? 'N/A' : undefined);

      if (!licensePlate || !brand || !model || !year || !color) {
        throw new UnprocessableEntityException(
          'Informações do veículo são obrigatórias para o tipo selecionado',
        );
      }

      const { id: vehicleId } = await tx.vehicle.create({
        data: {
          brand,
          color,
          licensePlate,
          model,
          vehicleTypeId,
          year,
        },
        select: {
          id: true,
        },
      });

      await tx.user.create({
        data: {
          email: deliveryman.email,
          password: hashedPassword,
          role: Role.DELIVERY,
          status: initialStatus,
          information: initialInformation,
          DeliveryMan: {
            create: {
              dob: new Date(deliveryman.dob),
              name: deliveryman.name,
              cpf: deliveryman.cpf,
              phone: deliveryman.phone,
              idAddress,
              vehicleId,
            },
          },
          Balance: {
            create: {
              amount: 0,
            },
          },
        },
      });
    });
  }

  private async generateBikePlate(
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    while (true) {
      const candidate = `BIKE${Math.floor(1000 + Math.random() * 9000)}`;
      const existingPlate = await tx.vehicle.findUnique({
        where: { licensePlate: candidate },
        select: { id: true },
      });

      if (!existingPlate) {
        return candidate;
      }
    }
  }

  async login(
    loginDto: LoginDto,
    isMobile: boolean,
  ): Promise<{ token: string; refreshToken: string; user: User }> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: {
          email: loginDto.email,
        },
        include: {
          Balance: {
            omit: {
              createdAt: true,
              updatedAt: true,
              id: true,
            },
          },
          Extract: {
            skip: 0,
            take: 10,
            orderBy: {
              createdAt: 'desc',
            },
          },
          Company: {
            omit: {
              createdAt: true,
              updatedAt: true,
              id: true,
              idUser: true,
              idAddress: true,
            },
            include: {
              Address: {
                omit: {
                  createdAt: true,
                  updatedAt: true,
                  id: true,
                },
              },
            },
          },
          DeliveryMan: {
            omit: {
              createdAt: true,
              updatedAt: true,
              id: true,
              userId: true,
              idAddress: true,
              vehicleId: true,
            },
            include: {
              Address: {
                omit: {
                  createdAt: true,
                  updatedAt: true,
                  id: true,
                },
              },
              Vehicle: {
                omit: {
                  createdAt: true,
                  updatedAt: true,
                  id: true,
                  vehicleTypeId: true,
                },
              },
            },
          },
        },
        omit: {
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      if (user.role === Role.DELIVERY && !isMobile) {
        throw new UnauthorizedException(
          'Apenas dispositivos móveis podem acessar a rota de entregadores',
        );
      }

      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const tokens = await this.generateTokens(user.id);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          Balance: user.Balance,
          Extract: user.Extract ?? [],
          Company: user.Company as unknown as Company,
          DeliveryMan: user.DeliveryMan as unknown as DeliveryMan,
        } as unknown as User,
      };
    });
  }

  async refresh(
    refreshToken: string,
  ): Promise<{ token: string; refreshToken: string }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const { secret } = this.getRefreshJwtConfig();

    try {
      const payload = await this.jwtService.verifyAsync<{
        id: number;
        tokenType?: string;
      }>(refreshToken, {
        secret,
      });

      if (payload.tokenType !== 'refresh' || !payload.id) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          status: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      if (user.status === UserStatus.BLOCKED) {
        throw new UnauthorizedException('User is blocked');
      }

      if (user.status === UserStatus.INACTIVE) {
        throw new UnauthorizedException('User is inactive');
      }

      return this.generateTokens(user.id);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async ensureUserEmail(dto: ForgotPasswordDto): Promise<void> {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(dto.newPassword, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
  }
}
