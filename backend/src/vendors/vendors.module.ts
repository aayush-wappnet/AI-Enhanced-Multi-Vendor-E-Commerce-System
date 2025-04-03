import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { Vendor } from './vendor.entity';
import { VendorRepository } from './vendor.repository';
import { UsersModule } from '../users/users.module';
import { Category } from '../products/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vendor, Category]), // Add Category to access it directly
    UsersModule,
  ],
  controllers: [VendorsController],
  providers: [VendorsService, VendorRepository],
  exports: [VendorsService],
})
export class VendorsModule {}