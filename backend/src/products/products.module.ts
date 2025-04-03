import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { Subcategory } from './entities/subcategory.entity';
import { ProductRepository } from './product.repository';
import { VendorsModule } from '../vendors/vendors.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, Subcategory]),
    forwardRef(() => VendorsModule),
  ],
  providers: [ProductsService, ProductRepository],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}