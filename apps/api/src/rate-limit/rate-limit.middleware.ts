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
  constructor(private cache: CacheService) { }

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
        'Não foi possível identificar a origem da requisição',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const RATE_LIMIT_MAX = 20; // Aumentado de 3 para 20
    const RATE_LIMIT_WINDOW = 60; // Aumentado de 1 para 60 segundos

    const requests = +((await this.cache.getValue(`rate-limit:${key}`)) ?? 0);

    if (requests >= RATE_LIMIT_MAX) {
      res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', RATE_LIMIT_WINDOW);

      throw new HttpException(
        'Limite de requisições excedido. Tente novamente em alguns segundos.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX);
    res.setHeader('X-RateLimit-Remaining', RATE_LIMIT_MAX - (requests + 1));
    res.setHeader('X-RateLimit-Reset', RATE_LIMIT_WINDOW);
    await this.cache.setCache(`rate-limit:${key}`, `${requests + 1}`, RATE_LIMIT_WINDOW);

    next();
  }
}
