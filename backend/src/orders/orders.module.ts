import { Module,forwardRef} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Payment } from '../payments/payment.entity';
import { ProductsModule } from '../products/products.module';
import { CartModule } from '../cart/cart.module';
import { UsersModule } from '../users/users.module';

import { PaymentsModule } from '../payments/payments.module';
import { OrderRepository } from './order.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem,OrderRepository]),
    forwardRef(() => PaymentsModule),
    ProductsModule,
    CartModule,
    UsersModule,
    
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderRepository],
  exports: [OrdersService],
})
export class OrdersModule {}

