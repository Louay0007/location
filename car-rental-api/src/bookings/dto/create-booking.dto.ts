import { IsInt, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  vehicleId: number;

  @ApiProperty({ example: '2025-01-15' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-01-20' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: '09:00', required: false })
  @IsOptional()
  @IsString()
  pickupTime?: string;

  @ApiProperty({ example: '18:00', required: false })
  @IsOptional()
  @IsString()
  returnTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}