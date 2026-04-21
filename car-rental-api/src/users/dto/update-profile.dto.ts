import { IsString, IsOptional, IsEmail, IsDateString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Ahmed' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Ben Ali' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'ahmed@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+21620123456' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '12345678' })
  @IsOptional()
  @IsString()
  cin?: string;

  @ApiPropertyOptional({ example: 'TU-987654' })
  @IsOptional()
  @IsString()
  drivingLicense?: string;

  @ApiPropertyOptional({ example: '2028-06-15' })
  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;
}