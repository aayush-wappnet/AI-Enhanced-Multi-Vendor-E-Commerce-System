import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CartRepository } from './cart.repository';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem]),
    ProductsModule, // Import ProductsModule to provide ProductsService
  ],
  controllers: [CartController],
  providers: [CartService, CartRepository],
  exports: [CartService], // Export for use in Orders module later
})
export class CartModule {}