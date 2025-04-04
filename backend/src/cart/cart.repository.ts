import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { User } from '../users/user.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartRepository {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    private productsService: ProductsService,
  ) {}

  async findOrCreateCart(user: User): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['items', 'items.product', 'user'],
    });
    if (!cart) {
      cart = this.cartRepository.create({ user, items: [] });
      await this.cartRepository.save(cart);
    }
    return cart;
  }

  async addToCart(user: User, addToCartDto: AddToCartDto): Promise<Cart> {
    const { productId, quantity } = addToCartDto;
    const cart = await this.findOrCreateCart(user);
    const product = await this.productsService.findById(productId);
    if (!product || product.status !== 'approved') {
      throw new NotFoundException('Product not found or not approved');
    }
    if (product.stock < quantity) {
      throw new NotFoundException('Insufficient stock');
    }

    let cartItem = cart.items.find((item) => item.product.id === productId);
    if (cartItem) {
      cartItem.quantity += quantity;
      await this.cartItemRepository.save(cartItem);
    } else {
      cartItem = this.cartItemRepository.create({ cart, product, quantity });
      cart.items.push(cartItem);
      await this.cartItemRepository.save(cartItem);
    }

    return this.findOrCreateCart(user); // Refresh cart with updated items
  }

  async updateCartItem(user: User, cartItemId: number, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.findOrCreateCart(user);
    const cartItem = cart.items.find((item) => item.id === cartItemId);
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }
    const product = await this.productsService.findById(cartItem.product.id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.stock < updateCartItemDto.quantity) {
      throw new NotFoundException('Insufficient stock');
    }

    cartItem.quantity = updateCartItemDto.quantity;
    await this.cartItemRepository.save(cartItem);
    return this.findOrCreateCart(user);
  }

  async removeCartItem(user: User, cartItemId: number): Promise<Cart> {
    const cart = await this.findOrCreateCart(user);
    const cartItem = cart.items.find((item) => item.id === cartItemId);
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.remove(cartItem);
    return this.findOrCreateCart(user);
  }

  async clearCart(user: User): Promise<void> {
    const cart = await this.findOrCreateCart(user);
    await this.cartItemRepository.delete({ cart: { id: cart.id } });
  }
}