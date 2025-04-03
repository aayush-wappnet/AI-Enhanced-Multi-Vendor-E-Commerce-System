import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vendor } from './vendor.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Category } from '../products/entities/category.entity';

@Injectable()
export class VendorRepository {
  constructor(
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Vendor[]> {
    return this.vendorRepository.find({ relations: ['user', 'category'] });
  }

  async findById(id: number): Promise<Vendor | null> {
    return this.vendorRepository.findOne({ where: { id }, relations: ['user', 'category'] });
  }

  async findCategoryById(id: number): Promise<Category | null> {
    return this.categoryRepository.findOne({ where: { id } });
  }

  async create(createVendorDto: CreateVendorDto, user: any, category: any): Promise<Vendor> {
    const vendor = this.vendorRepository.create({
      name: createVendorDto.name,
      description: createVendorDto.description,
      user,
      category,
    });
    return this.vendorRepository.save(vendor);
  }

  async update(id: number, updateVendorDto: UpdateVendorDto, category?: any): Promise<Vendor | null> {
    const updateData: any = { ...updateVendorDto };
    if (category) {
      updateData.category = category;
    }
    await this.vendorRepository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.vendorRepository.delete(id);
  }
}