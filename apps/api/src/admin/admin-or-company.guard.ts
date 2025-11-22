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
export class AdminOrCompanyGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: User }>();

    const user = request.user || ({} as User);

    const allowedRoles: Role[] = [Role.ADMIN, Role.COMPANY];

    if (!allowedRoles.includes(user.role)) {
      throw new UnauthorizedException(
        'Access denied: Admin or company privileges required.',
      );
    }

    return true;
  }
}
