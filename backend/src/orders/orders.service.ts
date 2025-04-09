// orders.service.ts
import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { OrderRepository } from './order.repository';
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
    private orderRepository: OrderRepository,
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
        return this.orderRepository.createOrderItem({
          product,
          quantity: item.quantity,
          price: product.price,
        });
      }),
    );

    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = this.orderRepository.create({ // Updated to use repository create
      user,
      orderItems,
      totalAmount,
      status: 'pending',
    });

    return this.orderRepository.save(order);
  }

  async confirmOrder(orderId: number, payment: Payment): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
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

  async cancelOrder(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');
    if (order.status === 'cancelled') throw new BadRequestException('Order is already cancelled');
    if (order.status === 'delivered') throw new BadRequestException('Delivered orders cannot be cancelled');
    if (order.status === 'pending' || order.status === 'confirmed') {
      order.status = 'cancelled';
      if (order.payment) {
        await this.paymentsService.updatePaymentStatus(order.payment.id, 'failed'); // Assume this method exists
      }
      await this.orderRepository.save(order);
      // Restore stock for pending/confirmed orders
      await Promise.all(
        order.orderItems.map(async (item) => {
          const product = await this.productsService.findById(item.product.id);
          if (product) {
            product.stock += item.quantity;
            await this.productsService.update(product.id, { stock: product.stock });
          }
        }),
      );
    }
    return order;
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');
    if (order.status === 'cancelled' && status !== 'cancelled') throw new BadRequestException('Cannot modify a cancelled order');
    if (order.status === 'delivered' && status !== 'delivered') throw new BadRequestException('Cannot modify a delivered order');
    order.status = status as 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    return this.orderRepository.save(order);
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }

  async findById(id: number): Promise<Order | null> {
    return this.orderRepository.findById(id);
  }

  async findByUserId(userId: number): Promise<Order[]> {
    return this.orderRepository.findByUserId(userId);
  }

  async getTotalProductsSold(): Promise<number> {
    const result = await this.orderRepository.getTotalProductsSold();
    return result || 0;
  }

  async getTotalSales(): Promise<number> {
    const result = await this.orderRepository.getTotalSales();
    return result || 0;
  }

  async getMostSoldProduct(): Promise<{ productId: number; name: string; quantity: number } | null> {
    const result = await this.orderRepository.getMostSoldProduct();
    return result || null;
  }

  async getTotalOrders(): Promise<number> {
    const result = await this.orderRepository.getTotalOrders();
    return result;
  }

  async getRevenueByStatus(): Promise<{ status: string; totalRevenue: number }[]> {
    const result = await this.orderRepository.getRevenueByStatus();
    return result.map(row => ({
      status: row.status,
      totalRevenue: typeof row.totalRevenue === 'string' ? parseFloat(row.totalRevenue) : row.totalRevenue || 0,
    }));
  }
}