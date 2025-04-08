import { Controller, Post, Get, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { User } from '../users/user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post('checkout')
  @Roles('customer')
  async checkout(@CurrentUser() user: User) {
    return this.ordersService.checkout(user.id);
  }

  @Get()
  @Roles('customer')
  async findByUser(@CurrentUser() user: User) {
    return this.ordersService.findByUserId(user.id);
  }

  @Get(':id')
  @Roles('customer')
  async findById(@Param('id') id: number, @CurrentUser() user: User) {
    const order = await this.ordersService.findById(id);
    if (!order || order.user.id !== user.id) throw new BadRequestException('Order not found or not authorized');
    return order;
  }
}