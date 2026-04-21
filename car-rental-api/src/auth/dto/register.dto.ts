import { IsEmail, IsString, MinLength, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Ahmed' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Ben Ali' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'ahmed@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MotDePasse@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: '+21620123456', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '12345678', required: false })
  @IsOptional()
  @IsString()
  cin?: string;

  @ApiProperty({ example: 'TU-987654', required: false })
  @IsOptional()
  @IsString()
  drivingLicense?: string;

  @ApiProperty({ example: '2028-06-15', required: false })
  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;
}