import type { JwtModuleOptions } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';

const getExpiresIn = (): SignOptions['expiresIn'] | undefined => {
  const value = process.env.JWT_EXPIRATION;
  return value ? (value as SignOptions['expiresIn']) : undefined;
};

export const jwtModuleConfig = (): JwtModuleOptions => {
  const expiresIn = getExpiresIn();

  return {
    global: true,
    secret: process.env.JWT_SECRET,
    signOptions: expiresIn ? { expiresIn } : undefined,
  };
};

