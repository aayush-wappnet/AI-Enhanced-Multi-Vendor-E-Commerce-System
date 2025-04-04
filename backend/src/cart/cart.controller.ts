import { Controller, Get, Post, Put, Delete, Body, Param, UsePipes, ValidationPipe, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Request } from 'express';
import { User } from '../users/user.entity';

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @Roles('customer')
  async getCart(@Req() req: Request) {
    return this.cartService.getCart(req.user as User);
  }

  @Post()
  @Roles('customer')
  @UsePipes(new ValidationPipe())
  async addToCart(@Req() req: Request, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user as User, addToCartDto);
  }

  @Put('item/:cartItemId')
  @Roles('customer')
  @UsePipes(new ValidationPipe())
  async updateCartItem(
    @Req() req: Request,
    @Param('cartItemId') cartItemId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(req.user as User, cartItemId, updateCartItemDto);
  }

  @Delete('item/:cartItemId')
  @Roles('customer')
  async removeCartItem(@Req() req: Request, @Param('cartItemId') cartItemId: number) {
    return this.cartService.removeCartItem(req.user as User, cartItemId);
  }

  @Delete()
  @Roles('customer')
  async clearCart(@Req() req: Request) {
    await this.cartService.clearCart(req.user as User);
    return { message: 'Cart cleared' };
  }
}