import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Role, User } from '@prisma/client';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: User }>();

    const user = request.user || {};

    if (user.role !== Role.ADMIN) {
      throw new UnauthorizedException(
        'Access denied: Admin privileges required.',
      );
    }

    return true;
  }
}
