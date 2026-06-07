import { Controller, Get, Put, Body, UseGuards, Post, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { User } from '@prisma/client';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: User) {
    return this.usersService.findById(user.id);
  }

  @Put('me')
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }

  @Get('me/addresses')
  getAddresses(@CurrentUser() user: User) {
    return this.usersService.getAddresses(user.id);
  }

  @Post('me/addresses')
  addAddress(@CurrentUser() user: User, @Body() dto: CreateAddressDto) {
    return this.usersService.addAddress(user.id, dto);
  }

  @Delete('me/addresses/:id')
  deleteAddress(@CurrentUser() user: User, @Param('id') id: string) {
    return this.usersService.deleteAddress(user.id, id);
  }

  @Put('me/addresses/:id/default')
  setDefaultAddress(@CurrentUser() user: User, @Param('id') id: string) {
    return this.usersService.setDefaultAddress(user.id, id);
  }
}
