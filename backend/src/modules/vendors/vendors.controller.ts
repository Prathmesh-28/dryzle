import {
  Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { VendorsService } from './vendors.service';
import { NearbyVendorsDto } from './dto/nearby-vendors.dto';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { Role, User } from '@prisma/client';

@ApiTags('vendors')
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get('nearby')
  getNearby(@Query() query: NearbyVendorsDto) {
    return this.vendorsService.findNearby(query);
  }

  @Get(':id')
  getVendor(@Param('id') id: string) {
    return this.vendorsService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  createVendor(@CurrentUser() user: User, @Body() dto: CreateVendorDto) {
    return this.vendorsService.create(user.id, dto);
  }

  @Put('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  updateVendor(@CurrentUser() user: User, @Body() dto: UpdateVendorDto) {
    return this.vendorsService.updateByUserId(user.id, dto);
  }

  @Patch('me/toggle-open')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  toggleOpen(@CurrentUser() user: User) {
    return this.vendorsService.toggleOpen(user.id);
  }

  @Get('me/services')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  getServices(@CurrentUser() user: User) {
    return this.vendorsService.getServices(user.id);
  }

  @Post('me/services')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  addService(@CurrentUser() user: User, @Body() dto: CreateServiceDto) {
    return this.vendorsService.addService(user.id, dto);
  }
}
