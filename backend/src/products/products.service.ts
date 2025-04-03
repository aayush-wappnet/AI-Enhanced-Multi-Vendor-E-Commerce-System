import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { VendorsService } from '../vendors/vendors.service';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    private productRepository: ProductRepository,
    private vendorsService: VendorsService,
    private configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async findById(id: number): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  async findCategoryById(id: number): Promise<any> {
    return this.productRepository.findCategoryById(id);
  }

  async findSubcategoryById(id: number): Promise<any> {
    return this.productRepository.findSubcategoryById(id);
  }

  async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map((file) =>
      cloudinary.uploader.upload(file.path, { folder: 'products' }).then((result) => result.secure_url),
    );
    return Promise.all(uploadPromises);
  }

  async create(createProductDto: CreateProductDto, files: Express.Multer.File[]): Promise<Product> {
    const vendor = await this.vendorsService.findById(createProductDto.vendorId);
    if (!vendor) throw new NotFoundException('Vendor not found');

    const category = await this.findCategoryById(createProductDto.categoryId);
    if (!category) throw new NotFoundException('Category not found');

    const subcategory = createProductDto.subcategoryId
      ? await this.findSubcategoryById(createProductDto.subcategoryId)
      : null;
    if (createProductDto.subcategoryId && !subcategory) throw new NotFoundException('Subcategory not found');

    if (vendor.category && vendor.category.id !== category.id) {
      throw new NotFoundException('Product category must match vendor store category');
    }

    const imageUrls = await this.uploadImages(files);
    return this.productRepository.create(createProductDto, vendor, category, subcategory, imageUrls);
  }

  async update(id: number, updateProductDto: UpdateProductDto, files?: Express.Multer.File[]): Promise<Product | null> {
    let subcategory;
    if (updateProductDto.subcategoryId) {
      subcategory = await this.findSubcategoryById(updateProductDto.subcategoryId);
      if (!subcategory) throw new NotFoundException('Subcategory not found');
    }

    let imageUrls;
    if (files && files.length > 0) {
      imageUrls = await this.uploadImages(files);
    }

    return this.productRepository.update(id, updateProductDto, subcategory, imageUrls);
  }

  async delete(id: number): Promise<void> {
    return this.productRepository.delete(id);
  }
}