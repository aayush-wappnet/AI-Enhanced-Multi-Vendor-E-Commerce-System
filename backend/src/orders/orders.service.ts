import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductsService } from '../products/products.service';
import { CartService } from '../cart/cart.service';
import { UsersService } from '../users/users.service';
import { PaymentsService } from '../payments/payments.service';
import { Payment } from '../payments/payment.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private productsService: ProductsService,
    private cartService: CartService,
    private usersService: UsersService,
    @Inject(forwardRef(() => PaymentsService)) // Explicitly handle circular dependency
    private paymentsService: PaymentsService,
  ) {}

  async checkout(userId: number): Promise<Order> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const cart = await this.cartService.getCart(user);
    if (!cart || !cart.items.length) throw new BadRequestException('Cart is empty');

    const orderItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = await this.productsService.findById(item.product.id);
        if (!product || product.status !== 'approved') {
          throw new BadRequestException(`Product not found or not approved: ${item.product.id}`);
        }
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product: ${product.name}`);
        }
        return this.orderItemRepository.create({
          product,
          quantity: item.quantity,
          price: product.price,
        });
      }),
    );

    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = this.orderRepository.create({
      user,
      orderItems,
      totalAmount,
      status: 'pending',
    });

    return this.orderRepository.save(order);
  }

  async confirmOrder(orderId: number, payment: Payment): Promise<Order> {
    const order = await this.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    order.status = 'confirmed';
    order.payment = payment;
    await this.orderRepository.save(order);

    await Promise.all(
      order.orderItems.map(async (item) => {
        const product = await this.productsService.findById(item.product.id);
        if (!product) throw new NotFoundException(`Product ${item.product.id} not found during stock update`);
        product.stock -= item.quantity;
        await this.productsService.update(product.id, { stock: product.stock });
      }),
    );

    await this.cartService.clearCart(order.user);

    return order;
  }

  async findById(id: number): Promise<Order | null> {
    return this.orderRepository.findOne({ where: { id }, relations: ['user', 'orderItems', 'orderItems.product', 'payment'] });
  }

  async findByUserId(userId: number): Promise<Order[]> {
    return this.orderRepository.find({ where: { user: { id: userId } }, relations: ['orderItems', 'orderItems.product', 'payment'] });
  }
}