import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findAllPublic(): Promise<Product[]> {
    return this.productRepository.find({
      where: { status: 'approved' },
      relations: ['vendor', 'category', 'subcategory'],
    });
  }

  async findByStatus(status: 'approved' | 'rejected'): Promise<Product[]> {
    return this.productRepository.find({
      where: { status },
      relations: ['vendor', 'category', 'subcategory'],
    });
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

  async findAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find({ relations: ['subcategories'] });
  }

  async findApprovedByCategoryAndSubcategory(categoryId: number, subcategoryId?: number): Promise<Product[]> {
    const query: any = {
      where: { status: 'approved', category: { id: categoryId } },
      relations: ['vendor', 'category', 'subcategory'],
    };
    if (subcategoryId) {
      query.where.subcategory = { id: subcategoryId };
    }
    return this.productRepository.find(query);
  }

  async findRecommendations(id: number): Promise<Product[]> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.vendor', 'vendor')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.subcategory', 'subcategory')
      .where('product.categoryId = :categoryId', { categoryId: product.category.id })
      .andWhere('product.id != :id', { id: id })
      .andWhere('product.status = :status', { status: 'approved' })
      .take(5) // Limit to 5 recommendations
      .getMany();
  }

  async create(
    productData: {
      name: string;
      description: string;
      price: number;
      stock: number;
      type: string;
      vendor: any;
      category: any;
      subcategory: any;
      imageUrls: string[];
      status: 'pending' | 'approved' | 'rejected';
    },
  ): Promise<Product> {
    const product = this.productRepository.create(productData);
    return this.productRepository.save(product);
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    subcategory?: any,
    imageUrls?: string[],
  ): Promise<Product | null> {
    const updateData: any = { ...updateProductDto };
    if (subcategory) updateData.subcategory = subcategory;
    if (imageUrls && imageUrls.length > 0) {
      const product = await this.findById(id);
      if (!product) throw new NotFoundException('Product not found');
      updateData.imageUrls = [...(product.imageUrls || []), ...imageUrls];
    }
    await this.productRepository.update(id, updateData);
    return this.findById(id);
  }

  async updateStatus(id: number, status: 'approved' | 'rejected'): Promise<Product | null> {
    await this.productRepository.update(id, { status });
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.productRepository.delete(id);
  }


  async findByVendorId(vendorId: number): Promise<Product[]> {
    return this.productRepository.find({
      where: { vendor: { id: vendorId } },
      relations: ['vendor', 'category', 'subcategory'],
    });
  }

}