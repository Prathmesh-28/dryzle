import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PromosService } from './promos.service';
import { ValidatePromoDto } from './dto/validate-promo.dto';
import { CreatePromoDto } from './dto/create-promo.dto';
import { Role } from '@prisma/client';

@ApiTags('promos')
@Controller('promos')
export class PromosController {
  constructor(private readonly promosService: PromosService) {}

  @Post('validate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  validate(@Body() dto: ValidatePromoDto) {
    return this.promosService.validate(dto);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreatePromoDto) {
    return this.promosService.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.promosService.findAll();
  }
}
