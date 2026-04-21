import { IsString, IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ example: 'AB-123-TU' })
  @IsString()
  registration: string;

  @ApiProperty({ example: 'Toyota' })
  @IsString()
  brand: string;

  @ApiProperty({ example: 'Corolla' })
  @IsString()
  model: string;

  @ApiProperty({ example: 2023 })
  @IsInt()
  @Min(1990)
  year: number;

  @ApiProperty({ example: 'Blanc' })
  @IsString()
  color: string;

  @ApiProperty({ example: 'SEDAN' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'AUTOMATIC' })
  @IsString()
  transmission: string;

  @ApiProperty({ example: 'ESSENCE' })
  @IsString()
  fuelType: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(2)
  seats: number;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(2)
  doors: number;

  @ApiProperty({ example: 120 })
  @IsNumber()
  @Min(0)
  dailyRate: number;

  @ApiProperty({ example: 200 })
  @IsNumber()
  @Min(0)
  depositAmount: number;

  @ApiProperty({ example: 15000 })
  @IsInt()
  @Min(0)
  mileage: number;

  @ApiProperty({ example: 'AVAILABLE', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: ['Climatisation'], required: false })
  @IsOptional()
  features?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}