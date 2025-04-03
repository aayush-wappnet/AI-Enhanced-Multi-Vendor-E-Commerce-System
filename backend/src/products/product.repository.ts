import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { Subcategory } from './entities/subcategory.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Subcategory)
    private subcategoryRepository: Repository<Subcategory>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({ relations: ['vendor', 'category', 'subcategory'] });
  }

  async findById(id: number): Promise<Product | null> {
    return this.productRepository.findOne({ where: { id }, relations: ['vendor', 'category', 'subcategory'] });
  }

  async findCategoryById(id: number): Promise<Category | null> {
    return this.categoryRepository.findOne({ where: { id } });
  }

  async findSubcategoryById(id: number): Promise<Subcategory | null> {
    return this.subcategoryRepository.findOne({ where: { id } });
  }

  async create(createProductDto: CreateProductDto, vendor: any, category: any, subcategory: any, imageUrls: string[]): Promise<Product> {
    const product = this.productRepository.create({
      ...createProductDto,
      vendor,
      category,
      subcategory,
      imageUrls,
    });
    return this.productRepository.save(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto, subcategory?: any, imageUrls?: string[]): Promise<Product | null> {
    const updateData: any = { ...updateProductDto };
    if (subcategory) updateData.subcategory = subcategory;
    if (imageUrls) updateData.imageUrls = imageUrls;
    await this.productRepository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.productRepository.delete(id);
  }
}