import { Injectable, NotFoundException } from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { User } from '../users/user.entity';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartService {
  constructor(private cartRepository: CartRepository) {}

  async getCart(user: User): Promise<Cart> {
    return this.cartRepository.findOrCreateCart(user);
  }

  async addToCart(user: User, addToCartDto: AddToCartDto): Promise<Cart> {
    return this.cartRepository.addToCart(user, addToCartDto);
  }

  async updateCartItem(user: User, cartItemId: number, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
    return this.cartRepository.updateCartItem(user, cartItemId, updateCartItemDto);
  }

  async removeCartItem(user: User, cartItemId: number): Promise<Cart> {
    return this.cartRepository.removeCartItem(user, cartItemId);
  }

  async clearCart(user: User): Promise<void> {
    return this.cartRepository.clearCart(user);
  }

  // For OrdersService compatibility (assuming repository handles relations)
  async findByUserId(userId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOrCreateCart({ id: userId } as User);
    if (!cart) throw new NotFoundException('Cart not found');
    return cart;
  }
}