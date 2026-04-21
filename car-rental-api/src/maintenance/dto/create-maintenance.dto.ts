import { IsString, IsInt, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMaintenanceDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  vehicleId: number;

  @ApiProperty({ enum: ['OIL_CHANGE', 'TECHNICAL_INSPECTION', 'INSURANCE', 'TIRE_CHANGE', 'BRAKE', 'CLEANING', 'ACCIDENT_REPAIR', 'OTHER'] })
  @IsEnum(['OIL_CHANGE', 'TECHNICAL_INSPECTION', 'INSURANCE', 'TIRE_CHANGE', 'BRAKE', 'CLEANING', 'ACCIDENT_REPAIR', 'OTHER'])
  type: string;

  @ApiProperty({ example: 'Vidange reguliere' })
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 150.0, required: false })
  @IsOptional()
  @IsNumber()
  cost?: number;

  @ApiProperty({ example: 25000, required: false })
  @IsOptional()
  @IsInt()
  mileageAt?: number;

  @ApiProperty({ example: '2025-01-15', required: false })
  @IsOptional()
  @IsDateString()
  doneDate?: string;

  @ApiProperty({ example: '2025-07-15', required: false })
  @IsOptional()
  @IsDateString()
  nextDueDate?: string;

  @ApiProperty({ example: 'Auto Service Tunis', required: false })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiProperty({ example: 'https://example.com/doc.pdf', required: false })
  @IsOptional()
  @IsString()
  documentUrl?: string;
}