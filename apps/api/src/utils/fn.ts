import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

export const createCode = (
  size = 4,
  prefix: string,
  characters = 'abcdefghjklmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789',
): string => {
  let code: string = '';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const _ of Array(size)) {
    const random = Math.floor(Math.random() * characters.length);
    code += characters[random];
  }

  return prefix.concat(code);
};

export const exceptionFactory = (
  validationErrors: ValidationError[],
): UnprocessableEntityException => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function mapErrors(errors: ValidationError[]): any {
    return errors.map((error) => {
      const constraints = Object.values(error.constraints ?? {});
      let children = undefined;

      if (error.children && error.children.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        children = mapErrors(error.children);
      }

      return {
        [error.property]: constraints.length ? constraints : children,
      };
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const errors = mapErrors(validationErrors);

  return new UnprocessableEntityException(errors);
};

export interface IPaginateResponse<T> {
  data: T[];
  total: number;
  currentPage: number;
  totalPage: number;
}

export const paginateResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
): IPaginateResponse<T> => {
  const totalPage = Math.ceil(total / limit);

  if (!data.length) {
    throw new NotFoundException({
      data,
      total,
      currentPage: page,
      totalPage,
    });
  }

  return {
    data,
    total,
    currentPage: page,
    totalPage,
  };
};

// Em um controller ou middleware
export function isMobileDevice(agent: string | undefined): boolean {
  const userAgent = agent ?? '';

  // Regex para detectar dispositivos móveis comuns
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

  return mobileRegex.test(userAgent);
}
