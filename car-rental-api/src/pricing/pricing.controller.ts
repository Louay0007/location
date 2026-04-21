import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { PricingService } from './pricing.service';
import { CreatePriceRuleDto } from './dto/create-price-rule.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Pricing')
@Controller('pricing')
export class PricingController {
  constructor(private pricingService: PricingService) {}

  @Public()
  @Get('rules')
  getActivePriceRules() {
    return this.pricingService.getActivePriceRules();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/rules')
  getAllPriceRules() {
    return this.pricingService.getAllPriceRules();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/rules/:id')
  getPriceRuleById(@Param('id') id: string) {
    return this.pricingService.getPriceRuleById(parseInt(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/rules')
  createPriceRule(@Body() dto: CreatePriceRuleDto) {
    return this.pricingService.createPriceRule(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('admin/rules/:id')
  updatePriceRule(@Param('id') id: string, @Body() dto: Partial<CreatePriceRuleDto>) {
    return this.pricingService.updatePriceRule(parseInt(id), dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('admin/rules/:id/toggle')
  togglePriceRule(@Param('id') id: string) {
    return this.pricingService.togglePriceRule(parseInt(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('admin/rules/:id')
  deletePriceRule(@Param('id') id: string) {
    return this.pricingService.deletePriceRule(parseInt(id));
  }
}