import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Payment } from './entities/payment.entity';
import { ProductsService } from '../products/products.service';
import { CartService } from '../cart/cart.service';
import { UsersService } from '../users/users.service';
import Stripe from 'stripe';

@Injectable()
export class OrdersService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private productsService: ProductsService,
    private cartService: CartService,
    private usersService: UsersService,
  ) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not defined in .env');
    this.stripe = new Stripe(stripeKey, { apiVersion: '2025-03-31.basil' }); // Updated to latest API version
  }

  async checkout(userId: number, paymentMethodId: string): Promise<Order> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const cart = await this.cartService.getCart(user);
    if (!cart || !cart.items.length) throw new BadRequestException('Cart is empty');

    // Calculate total and prepare order items
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

    // Create order (pending)
    const order = this.orderRepository.create({
      user,
      orderItems,
      totalAmount,
      status: 'pending',
    });

    // Process payment
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: 'usd',
        payment_method: paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
      });

      if (paymentIntent.status === 'succeeded') {
        const payment = this.paymentRepository.create({
          order,
          user,
          transactionId: paymentIntent.id,
          amount: totalAmount,
          status: 'completed',
          paymentMethod: 'stripe',
        });
        await this.paymentRepository.save(payment);

        // Update order and stock
        order.status = 'confirmed';
        order.payment = payment;
        await this.orderRepository.save(order);

        // Update product stock
        await Promise.all(
          orderItems.map(async (item) => {
            const product = await this.productsService.findById(item.product.id);
            if (!product) throw new NotFoundException(`Product ${item.product.id} not found during stock update`);
            product.stock -= item.quantity;
            await this.productsService.update(product.id, { stock: product.stock });
          }),
        );

        // Clear cart
        await this.cartService.clearCart(user);

        return order;
      } else {
        throw new BadRequestException('Payment requires further action');
      }
    } catch (error) {
      console.error('Payment Error:', error);
      throw new BadRequestException(`Payment failed: ${error.message}`);
    }
  }

  async findById(id: number): Promise<Order | null> {
    return this.orderRepository.findOne({ where: { id }, relations: ['user', 'orderItems', 'orderItems.product', 'payment'] });
  }

  async findByUserId(userId: number): Promise<Order[]> {
    return this.orderRepository.find({ where: { user: { id: userId } }, relations: ['orderItems', 'orderItems.product', 'payment'] });
  }
}