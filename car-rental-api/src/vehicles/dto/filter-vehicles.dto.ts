import { IsOptional, IsString, IsEnum, IsInt, Min, Max, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FilterVehiclesDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['ECONOMY', 'COMPACT', 'SEDAN', 'SUV', 'LUXURY', 'VAN'] })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: ['ESSENCE', 'DIESEL', 'HYBRID', 'ELECTRIC'] })
  @IsOptional()
  @IsString()
  fuelType?: string;

  @ApiPropertyOptional({ enum: ['MANUAL', 'AUTOMATIC'] })
  @IsOptional()
  @IsString()
  transmission?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2)
  minSeats?: number;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(9)
  maxSeats?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ example: 300 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ enum: ['AVAILABLE', 'RENTED', 'MAINTENANCE', 'OUT_OF_SERVICE'] })
  @IsOptional()
  @IsString()
  status?: string;
}