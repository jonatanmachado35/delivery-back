import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyDto } from './dto/company.dto';
import { LocationService } from '../location/location.service';
import { Company, DeliveryMan, Role, User, UserStatus } from '@prisma/client';
import { DeliverymanDto } from './dto/deliverymen.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private locationService: LocationService,
  ) {}

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
      const requiresDocument =
        (vehicleType.type ?? '').toLowerCase() !== 'bike';
      const initialStatus = requiresDocument
        ? (UserStatus.NO_DOCUMENTS as UserStatus)
        : UserStatus.ACTIVE;
      const initialInformation = requiresDocument
        ? `
          ### Sistema
          - Aguardando documentos
          - Aguardando desbloqueio`
        : 'Cadastro liberado automaticamente';

      const existingVehicle = await tx.vehicle.findFirst({
        where: { licensePlate: deliveryman.licensePlate },
        select: { id: true },
      });

      if (existingVehicle) {
        throw new ConflictException('Placa já cadastrada');
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(deliveryman.password, salt);

      const existingUser = await tx.user.findUnique({
        where: { email: deliveryman.email },
      });

      if (existingUser) {
        throw new ConflictException('Email já cadastrado');
      }

      const existingCpf = await tx.user.findFirst({
        where: { DeliveryMan: { cpf: deliveryman.cpf } },
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

      const { id: vehicleId } = await tx.vehicle.create({
        data: {
          brand: deliveryman.brand,
          color: deliveryman.color,
          licensePlate: deliveryman.licensePlate,
          model: deliveryman.model,
          vehicleTypeId,
          year: deliveryman.year,
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

  async login(
    loginDto: LoginDto,
    isMobile: boolean,
  ): Promise<{ token: string; user: User }> {
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

      const payload = { id: user.id };

      return {
        token: await this.jwtService.signAsync(payload),
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
}
