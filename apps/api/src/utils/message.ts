import { ValidationArguments } from 'class-validator';

const message = {
  isDecimalPlates: (validationArguments: ValidationArguments): string => {
    const maxDecimalPlaces = (
      validationArguments.constraints as unknown as Array<{
        maxDecimalPlaces: number;
      }>
    )[0]['maxDecimalPlaces'];

    return `o campo ${validationArguments.property} deve ser um número com até ${maxDecimalPlaces} casas decimais`;
  },
  isNumber: (validationArguments: ValidationArguments): string => {
    return `o campo ${validationArguments.property} deve ser um número`;
  },
  isMax: (validationArguments: ValidationArguments): string => {
    return `o campo ${validationArguments.property} deve ser menor ou igual a ${validationArguments.constraints[0]}`;
  },
  isMin: (validationArguments: ValidationArguments): string => {
    return `o campo ${validationArguments.property} deve ser maior ou igual a ${validationArguments.constraints[0]}`;
  },
  isString: (validationArguments: ValidationArguments): string => {
    return `o campo ${validationArguments.property} deve ser uma string`;
  },
  minLength: (validationArguments: ValidationArguments): string => {
    return `o campo ${validationArguments.property} deve ter no mínimo ${validationArguments.constraints[0]} caracteres`;
  },
  isEmail: (validationArguments: ValidationArguments): string => {
    return `o campo ${validationArguments.property} deve ser um email válido`;
  },
  isNotEmpty: (validationArguments: ValidationArguments): string => {
    return `o campo ${validationArguments.property} não pode ser vazio`;
  },
};

export { message };
