import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { OrdersService } from '../orders/orders.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService,
  ) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not defined in .env');
    this.stripe = new Stripe(stripeKey, { apiVersion: '2025-03-31.basil' });
  }

  async createPaymentIntent(orderId: number, amount: number): Promise<{ clientSecret: string }> {
    const order = await this.ordersService.findById(orderId);
    if (!order || order.status !== 'pending') {
      throw new BadRequestException('Order not found or not in pending state');
    }
  
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'inr',
      metadata: { orderId: orderId.toString() },
      statement_descriptor_suffix: `Order #${orderId}`, // Short suffix for statement (≤ 22 chars)
      description: `E-commerce purchase for Order #${orderId} from ShoppingMart - Export Transaction`, // Detailed description
    });
  
    if (!paymentIntent.client_secret) {
      throw new BadRequestException('Failed to generate payment intent client secret');
    }
  
    return { clientSecret: paymentIntent.client_secret };
  }

  async confirmPayment(orderId: number, paymentIntentId: string): Promise<Payment> {
    const order = await this.ordersService.findById(orderId);
    if (!order) throw new BadRequestException('Order not found');

    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment not successful');
    }

    const payment = this.paymentRepository.create({
      order,
      user: order.user,
      transactionId: paymentIntentId,
      amount: paymentIntent.amount / 100, // Convert back to INR
      status: 'completed',
      paymentMethod: 'stripe',
    });

    await this.paymentRepository.save(payment);
    await this.ordersService.confirmOrder(orderId, payment);

    return payment;
  }
}