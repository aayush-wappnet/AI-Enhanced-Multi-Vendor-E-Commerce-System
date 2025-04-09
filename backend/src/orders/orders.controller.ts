// orders.controller.ts
import { Controller, Post, Get, Param, Put, UseGuards, BadRequestException, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { User } from '../users/user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Logger } from '@nestjs/common';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private ordersService: OrdersService) {}


  @Get('all-orders')
  @Roles('admin')
  async getAllOrders(@CurrentUser() user: User) {
    console.log('User in endpoint:', user);
    // this.logger.log(`Fetching all orders for user: ${user.id} with role: ${user.role}`);
    return this.ordersService.getAllOrders();
  }

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

  @Put(':id/cancel')
  @Roles('customer')
  async cancelOrder(@Param('id') id: number, @CurrentUser() user: User) {
    const order = await this.ordersService.findById(id);
    if (!order || order.user.id !== user.id) throw new BadRequestException('Order not found or not authorized');
    if (order.status === 'cancelled') throw new BadRequestException('Order is already cancelled');
    if (order.status === 'delivered') throw new BadRequestException('Delivered orders cannot be cancelled');
    return this.ordersService.cancelOrder(id);
  }



  @Put(':id/status')
  @Roles('admin')
  async updateOrderStatus(@Param('id') id: number, @Body('status') status: string) {
    const validStatuses = ['confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) throw new BadRequestException('Invalid status');
    return this.ordersService.updateOrderStatus(id, status);
  }

  @Get('sales/total-products-sold')
  @Roles('admin')
  async getTotalProductsSold() {
    return this.ordersService.getTotalProductsSold();
  }

  @Get('sales/total-sales')
  @Roles('admin')
  async getTotalSales() {
    return this.ordersService.getTotalSales();
  }

  @Get('sales/most-sold-product')
  @Roles('admin')
  async getMostSoldProduct() {
    return this.ordersService.getMostSoldProduct();
  }

  @Get('sales/total-orders')
  @Roles('admin')
  async getTotalOrders() {
    return this.ordersService.getTotalOrders();
  }

  @Get('sales/revenue-by-status')
  @Roles('admin')
  async getRevenueByStatus() {
    return this.ordersService.getRevenueByStatus();
  }
}