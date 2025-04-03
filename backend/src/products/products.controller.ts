import { Controller, Get, Post, Put, Delete, Body, Param, UsePipes, ValidationPipe, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/Decorators/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @Roles('admin', 'vendor', 'customer')
  async findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'vendor', 'customer')
  async findById(@Param('id') id: number) {
    return this.productsService.findById(id);
  }

  @Post()
  @Roles('admin', 'vendor')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
  async create(@Body() createProductDto: CreateProductDto, @UploadedFiles() files: { images?: Express.Multer.File[] }) {
    return this.productsService.create(createProductDto, files?.images || []);
  }

  @Put(':id')
  @Roles('admin', 'vendor')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
  async update(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    return this.productsService.update(id, updateProductDto, files?.images);
  }

  @Delete(':id')
  @Roles('admin', 'vendor')
  async delete(@Param('id') id: number) {
    return this.productsService.delete(id);
  }
}