// vendor.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { VendorRepository } from './vendor.repository';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UsersService } from '../users/users.service';
import { Vendor } from './vendor.entity';

@Injectable()
export class VendorsService {
  constructor(
    private vendorRepository: VendorRepository,
    private usersService: UsersService,
  ) {}

  async findAll(): Promise<Vendor[]> {
    return this.vendorRepository.findAll();
  }

  async findById(id: number): Promise<Vendor | null> {
    return this.vendorRepository.findById(id);
  }

  async findByUserId(userId: number): Promise<Vendor[]> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.vendorRepository.findByUserId(userId);
  }

  async getPendingCount(): Promise<number> {
    return this.vendorRepository.countByStatus('pending');
  }

  async getApprovedCount(): Promise<number> {
    return this.vendorRepository.countByStatus('approved');
  }

  async getRejectedCount(): Promise<number> {
    return this.vendorRepository.countByStatus('rejected');
  }

  async create(createVendorDto: CreateVendorDto): Promise<Vendor> {
    const user = await this.usersService.findById(createVendorDto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const category = await this.vendorRepository.findCategoryById(createVendorDto.categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.vendorRepository.create(createVendorDto, user, category);
  }

  async update(id: number, updateVendorDto: UpdateVendorDto): Promise<Vendor | null> {
    let category;
    if (updateVendorDto.categoryId) {
      category = await this.vendorRepository.findCategoryById(updateVendorDto.categoryId);
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }
    return this.vendorRepository.update(id, updateVendorDto, category);
  }

  async approve(id: number): Promise<Vendor | null> {
    const vendor = await this.findById(id);
    if (!vendor) throw new NotFoundException('Vendor not found');
    return this.vendorRepository.updateStatus(id, 'approved');
  }

  async reject(id: number): Promise<Vendor | null> {
    const vendor = await this.findById(id);
    if (!vendor) throw new NotFoundException('Vendor not found');
    return this.vendorRepository.updateStatus(id, 'rejected');
  }

  async delete(id: number): Promise<void> {
    return this.vendorRepository.delete(id);
  }
}