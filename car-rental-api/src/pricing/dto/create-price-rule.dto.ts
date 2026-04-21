import { IsString, IsNumber, IsEnum, IsOptional, IsInt, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePriceRuleDto {
  @ApiProperty({ example: 'Ete 2025' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ['SEASONAL', 'WEEKEND', 'LONG_TERM', 'PROMO'] })
  @IsEnum(['SEASONAL', 'WEEKEND', 'LONG_TERM', 'PROMO'])
  type: string;

  @ApiProperty({ example: 20, description: 'Pourcentage de remise (negatif) ou majoration (positif)' })
  @IsNumber()
  discountPct?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  extraPct?: number;

  @ApiProperty({ example: 7, required: false })
  @IsOptional()
  @IsInt()
  minDays?: number;

  @ApiProperty({ example: '2025-07-01', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '2025-08-31', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ enum: ['ECONOMY', 'COMPACT', 'SEDAN', 'SUV', 'LUXURY', 'VAN'], required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  vehicleId?: number;
}