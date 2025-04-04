import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne } from 'typeorm';
import { Order } from './order.entity'; // Adjust the import path as necessary
import { User } from '../../users/user.entity'; // Adjust the import path as necessary

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Order, (order) => order.payment)
  order: Order;

  @ManyToOne(() => User, (user) => user.payments)
  user: User;

  @Column()
  transactionId: string; // Stripe/PayPal transaction ID

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: ['pending', 'completed', 'failed'], default: 'pending' })
  status: string;

  @Column()
  paymentMethod: string; // e.g., 'stripe', 'paypal'

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}