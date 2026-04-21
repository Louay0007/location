import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'ahmed@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MotDePasse@123' })
  @IsString()
  @MinLength(8)
  password: string;
}