import { Controller, Get, Post, Put, Delete, Body, Param, Query, UsePipes, ValidationPipe, UseGuards, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Public } from '../common/decorators/public.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @Public()
  async findAll() {
    return this.productsService.findAllPublic();
  }

  @Get('all')
  @Roles('admin')
  async findAllProducts() {
    return this.productsService.findAll();
  }

  @Get('approved')
  @Roles('admin')
  async findApprovedProducts() {
    return this.productsService.findApproved();
  }

  @Get('rejected')
  @Roles('admin')
  async findRejectedProducts() {
    return this.productsService.findRejected();
  }

  @Get('categories')
  @Public()
  async findAllCategories() {
    return this.productsService.findAllCategories();
  }

  @Get(':id')
  @Roles('admin', 'vendor', 'customer')
  async findById(@Param('id') id: number) {
    return this.productsService.findById(id);
  }

  @Get('category/:categoryId')
  async findApprovedByCategoryAndSubcategory(
    @Param('categoryId') categoryId: number,
    @Query('subcategoryId') subcategoryId?: number,
  ) {
    return this.productsService.findApprovedByCategoryAndSubcategory(categoryId, subcategoryId);
  }

  @Get(':id/recommendations')
  @Roles('admin', 'vendor', 'customer')
  // @Public() // Allow public access if needed, adjust based on your security requirements
  async getRecommendations(@Param('id') id: number) {
    return this.productsService.getRecommendations(id);
  }

  @Post()
  @Roles('vendor')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    if (!files || !files.images || files.images.length === 0) {
      throw new BadRequestException('At least one image file is required');
    }
    files.images.forEach((file, index) => {
      if (!file.path) {
        throw new BadRequestException(`Image file at index ${index} is missing a valid path`);
      }
    });
    return this.productsService.create(createProductDto, files.images);
  }

  @Put(':id')
  @Roles('admin', 'vendor')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
  async update(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    return this.productsService.update(id, updateProductDto, files?.images);
  }

  @Put(':id/approve')
  @Roles('admin')
  async approve(@Param('id') id: number) {
    return this.productsService.approve(id);
  }

  @Put(':id/reject')
  @Roles('admin')
  async reject(@Param('id') id: number) {
    return this.productsService.reject(id);
  }

  @Delete(':id')
  @Roles('admin', 'vendor')
  async delete(@Param('id') id: number) {
    return this.productsService.delete(id);
  }
}