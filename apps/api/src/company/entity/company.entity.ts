import { ApiProperty } from '@nestjs/swagger';

export class CompanyEntity {
  @ApiProperty({
    description: 'The unique identifier of the company',
    example: '12345',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the company',
    example: 'Tech Corp',
  })
  name: string;

  @ApiProperty({
    description: 'The email address of the company',
    example: 'contact@techcorp.com',
  })
  email: string;

  @ApiProperty({
    description: 'The phone number of the company',
    example: '+1234567890',
  })
  phone: string;

  @ApiProperty({
    description: 'The address of the company',
    example: '123 Tech Street, Silicon Valley, CA',
  })
  address: string;
}
