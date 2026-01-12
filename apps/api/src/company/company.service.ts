import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) { }

  async updateStatus(
    companyParamId: number,
    body: { status: UserStatus; information?: string },
  ): Promise<void> {
    if (!Number.isInteger(companyParamId) || companyParamId <= 0) {
      throw new BadRequestException('Identificador da empresa inválido');
    }

    // Find company by id or user id
    const company = await this.prisma.company.findFirst({
      where: {
        OR: [
          { idUser: companyParamId },
          { id: companyParamId },
        ],
      },
      select: {
        id: true,
        idUser: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Update the user's status
    await this.prisma.user.update({
      where: { id: company.idUser },
      data: {
        status: body.status,
        ...(body.information !== undefined && {
          information: body.information,
        }),
      },
    });
  }
}
