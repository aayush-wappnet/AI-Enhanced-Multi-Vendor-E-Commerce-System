import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Vendor } from '../../vendors/vendor.entity';
import { Category } from './category.entity';
import { Subcategory } from './subcategory.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  stock: number;

  @Column({ type: 'enum', enum: ['physical', 'digital', 'subscription'], default: 'physical' })
  type: string;

  @Column('json', { nullable: true }) // Array of Cloudinary URLs
  imageUrls: string[];

  @ManyToOne(() => Vendor, (vendor) => vendor.products)
  vendor: Vendor;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @ManyToOne(() => Subcategory, (subcategory) => subcategory.products, { nullable: true })
  subcategory: Subcategory;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}