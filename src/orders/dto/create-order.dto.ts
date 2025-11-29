import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNumber, IsString, Max } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    example: 'Fulano de Tal',
    description: 'Nome do cliente que está realizando o pedido.',
  })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({
    example: 'fulano@example.com',
    description: 'E-mail de contato do cliente.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '12345678901',
    description: 'CPF do cliente (somente números).',
  })
  @IsString()
  @IsNotEmpty()
  cpf: string;

  @ApiProperty({
    example: '61999999999',
    description: 'Telefone do cliente (DDD + número, apenas dígitos).',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'Plano Connect Digital Mensal',
    description: 'Nome do produto ou serviço associado ao pedido.',
  })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({
    example: 10000,
    description:
      'Valor do pedido em centavos. Ex: 10000 = R$ 100,00. Limitado a R$ 10.000,00.',
  })
  @Type(() => Number)
  @IsNumber()
  @Max(10000 * 100)
  amount: number;

  @ApiProperty({
    example: 'Rua Exemplo, 123, Bairro Centro, Brasília/DF',
    description: 'Endereço do cliente para referência/billing.',
  })
  @IsString()
  @IsNotEmpty()
  address: string;
}
