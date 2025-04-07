// products.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { VendorsService } from '../vendors/vendors.service';
import { v2 as cloudinary } from 'cloudinary';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { unlink } from 'fs/promises';

@Injectable()
export class ProductsService {
  constructor(
    private productRepository: ProductRepository,
    private vendorsService: VendorsService,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async findAllPublic(): Promise<Product[]> {
    return this.productRepository.findAllPublic();
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

  async findAllCategories(): Promise<Category[]> {
    return this.productRepository.findAllCategories();
  }

  async findApprovedByCategoryAndSubcategory(categoryId: number, subcategoryId?: number): Promise<Product[]> {
    return this.productRepository.findApprovedByCategoryAndSubcategory(categoryId, subcategoryId);
  }

  async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map(async (file) => {
      try {
        const result = await cloudinary.uploader.upload(file.path, { folder: 'products' });
        await unlink(file.path).catch((err) => console.error('Failed to delete temp file:', err));
        return result.secure_url;
      } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw new BadRequestException(`Failed to upload image: ${error.message}`);
      }
    });
    return Promise.all(uploadPromises);
  }

  async create(createProductDto: CreateProductDto, files: Express.Multer.File[]): Promise<Product> {
    const vendor = await this.vendorsService.findById(parseInt(createProductDto.vendorId, 10));
    if (!vendor) throw new NotFoundException('Vendor not found');
    if (vendor.status !== 'approved') throw new NotFoundException('Vendor must be approved to create products');

    const category = await this.findCategoryById(parseInt(createProductDto.categoryId, 10));
    if (!category) throw new NotFoundException('Category not found');

    const subcategory = createProductDto.subcategoryId
      ? await this.findSubcategoryById(parseInt(createProductDto.subcategoryId, 10))
      : null;
    if (createProductDto.subcategoryId && !subcategory) throw new NotFoundException('Subcategory not found');

    if (vendor.category && vendor.category.id !== category.id) {
      throw new NotFoundException('Product category must match vendor store category');
    }

    const imageUrls = await this.uploadImages(files);

    const productData = {
      name: createProductDto.name,
      description: createProductDto.description,
      price: parseFloat(createProductDto.price),
      stock: parseInt(createProductDto.stock, 10),
      type: createProductDto.type,
      vendor,
      category,
      subcategory,
      imageUrls,
      status: 'pending' as const,
    };

    if (isNaN(productData.price) || isNaN(productData.stock)) {
      throw new BadRequestException('Price and stock must be valid numbers');
    }

    return this.productRepository.create(productData);
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

  async approve(id: number): Promise<Product | null> {
    const product = await this.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    return this.productRepository.updateStatus(id, 'approved');
  }

  async reject(id: number): Promise<Product | null> {
    const product = await this.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    return this.productRepository.updateStatus(id, 'rejected');
  }

  async delete(id: number): Promise<void> {
    return this.productRepository.delete(id);
  }
}