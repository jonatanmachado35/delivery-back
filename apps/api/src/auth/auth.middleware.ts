import {
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}
  async use(req: Request, res: Response, next: () => void): Promise<void> {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const { id } = this.jwtService.verify<{ id: number }>(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.prismaService.user.findUnique({
        where: { id },
        select: {
          id: true,
          role: true,
          status: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('token invalid');
      }

      (req as Request & { user: User }).user = user as User;

      if (user.role === Role.ADMIN) {
        return next();
      }

      if (user.status === 'BLOCKED') {
        throw new UnauthorizedException('User is blocked');
      }

      if (user.status === 'INACTIVE') {
        throw new UnauthorizedException('User is inactive');
      }

      next();
    } catch (error) {
      this.logger.error(error);

      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException(error.message);
      }

      throw error;
    }
  }
}
