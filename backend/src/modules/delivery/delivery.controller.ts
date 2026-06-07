import { Controller, Get, Post, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DeliveryService } from './delivery.service';
import { CreateDeliveryBoyDto } from './dto/create-delivery-boy.dto';
import { Role, User } from '@prisma/client';

@ApiTags('delivery')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post('register')
  register(@CurrentUser() user: User, @Body() dto: CreateDeliveryBoyDto) {
    return this.deliveryService.register(user.id, dto);
  }

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(Role.DELIVERY_BOY)
  getProfile(@CurrentUser() user: User) {
    return this.deliveryService.getProfile(user.id);
  }

  @Patch('me/availability')
  @UseGuards(RolesGuard)
  @Roles(Role.DELIVERY_BOY)
  toggleAvailability(@CurrentUser() user: User) {
    return this.deliveryService.toggleAvailability(user.id);
  }

  @Get('me/orders')
  @UseGuards(RolesGuard)
  @Roles(Role.DELIVERY_BOY)
  getOrders(@CurrentUser() user: User) {
    return this.deliveryService.getAssignedOrders(user.id);
  }

  @Get('me/earnings')
  @UseGuards(RolesGuard)
  @Roles(Role.DELIVERY_BOY)
  getEarnings(@CurrentUser() user: User) {
    return this.deliveryService.getEarnings(user.id);
  }
}
