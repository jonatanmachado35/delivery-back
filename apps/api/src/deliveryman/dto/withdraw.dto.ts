import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class WithdrawRequestDto {
    @ApiProperty({ description: 'Valor a ser sacado', example: 50.00 })
    @IsNumber()
    @Min(0.01)
    amount: number;

    @ApiProperty({ description: 'Chave PIX', example: '11999999999', required: false })
    @IsOptional()
    @IsString()
    pixKey?: string;
}

export class WithdrawResponseDto {
    @ApiProperty({ description: 'ID da transação' })
    id: number;

    @ApiProperty({ description: 'Valor sacado' })
    amount: number;

    @ApiProperty({ description: 'Novo saldo' })
    newBalance: number;

    @ApiProperty({ description: 'Status da transação' })
    status: string;
}
