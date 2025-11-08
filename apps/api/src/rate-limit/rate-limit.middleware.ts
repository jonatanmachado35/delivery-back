import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { Request, Response } from 'express';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private cache: CacheService) {}

  async use(req: Request, res: Response, next: () => void) {
    const key = [
      req.headers['authorization']?.split(' ')[1],
      req.ip,
      req.headers['x-forwarded-for'],
      req.socket.remoteAddress,
    ]
      .find(Boolean)
      ?.toString();

    if (!key) {
      throw new HttpException(
        'Chave de rate limit não encontrada',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const requests = +((await this.cache.getValue(`rate-limit:${key}`)) ?? 0);

    if (requests >= 3) {
      res.setHeader('X-RateLimit-Limit', 10);
      res.setHeader('X-RateLimit-Remaining', 0);

      throw new HttpException(
        'Limite de requisições excedido',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    res.setHeader('X-RateLimit-Limit', 10);
    res.setHeader('X-RateLimit-Remaining', 10 - (requests + 1));
    await this.cache.setCache(`rate-limit:${key}`, `${requests + 1}`, 1);

    next();
  }
}
