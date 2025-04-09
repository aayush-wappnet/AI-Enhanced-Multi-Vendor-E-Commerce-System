// order.repository.ts
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { In } from 'typeorm';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  create(entity: Partial<Order>): Order {
    return this.orderRepository.create(entity);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({ relations: ['user', 'orderItems', 'orderItems.product', 'payment'] });
  }

  async findById(id: number): Promise<Order | null> {
    return this.orderRepository.findOne({ where: { id }, relations: ['user', 'orderItems', 'orderItems.product', 'payment'] });
  }

  async findByUserId(userId: number): Promise<Order[]> {
    return this.orderRepository.find({ where: { user: { id: userId } }, relations: ['orderItems', 'orderItems.product', 'payment'] });
  }

  async save(order: Order): Promise<Order> {
    return this.orderRepository.save(order);
  }

  createOrderItem(data: Partial<OrderItem>): Promise<OrderItem> {
    const orderItem = this.orderItemRepository.create(data);
    return this.orderItemRepository.save(orderItem);
  }

  async getTotalProductsSold(): Promise<number> {
    const result = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .select('SUM(orderItem.quantity)', 'total')
      .innerJoin('orderItem.order', 'order')
      .where('order.status IN (:...statuses)', { statuses: ['confirmed', 'shipped', 'delivered'] })
      .getRawOne();
    return result.total || 0;
  }

  async getTotalSales(): Promise<number> {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.status IN (:...statuses)', { statuses: ['confirmed', 'shipped', 'delivered'] })
      .getRawOne();
    return result.total || 0;
  }

  async getMostSoldProduct(): Promise<{ productId: number; name: string; quantity: number } | null> {
    const result = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .select(['orderItem.productId AS productId', 'product.name AS name', 'SUM(orderItem.quantity) AS quantity'])
      .innerJoin('orderItem.product', 'product')
      .innerJoin('orderItem.order', 'order')
      .where('order.status IN (:...statuses)', { statuses: ['confirmed', 'shipped', 'delivered'] })
      .groupBy('orderItem.productId, product.name')
      .orderBy('quantity', 'DESC')
      .limit(1)
      .getRawOne();
    return result || null;
  }

  async getTotalOrders(): Promise<number> {
    return this.orderRepository.count({ where: { status: In(['confirmed', 'shipped', 'delivered']) } });
  }

  async getRevenueByStatus(): Promise<{ status: string; totalRevenue: number }[]> {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select(['order.status AS status', 'SUM(order.totalAmount) AS totalRevenue'])
      .where('order.status IN (:...statuses)', { statuses: ['confirmed', 'shipped', 'delivered'] })
      .groupBy('order.status')
      .getRawMany();
    return result;
  }
}