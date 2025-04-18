// vendor.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UsePipes, ValidationPipe, UseGuards, Query } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendorsController {
  constructor(private vendorsService: VendorsService) {}

  @Get()
  @Roles('admin', 'vendor')
  async findAll() {
    return this.vendorsService.findAll();
  }

  @Get('user/:userId')
  @Roles('admin', 'vendor')
  async findByUserId(@Param('userId') userId: number) {
    return this.vendorsService.findByUserId(userId);
  }

  @Get(':id')
  @Roles('admin', 'vendor')
  async findById(@Param('id') id: number) {
    return this.vendorsService.findById(id);
  }

  @Get('pending/count')
  @Roles('admin')
  async getPendingCount() {
    return this.vendorsService.getPendingCount();
  }

  @Get('approved/count')
  @Roles('admin')
  async getApprovedCount() {
    return this.vendorsService.getApprovedCount();
  }

  @Get('rejected/count')
  @Roles('admin')
  async getRejectedCount() {
    return this.vendorsService.getRejectedCount();
  }

  @Post()
  @Roles('vendor')
  @UsePipes(new ValidationPipe())
  async create(@Body() createVendorDto: CreateVendorDto) {
    return this.vendorsService.create(createVendorDto);
  }

  @Put(':id')
  @Roles('admin', 'vendor')
  @UsePipes(new ValidationPipe())
  async update(@Param('id') id: number, @Body() updateVendorDto: UpdateVendorDto) {
    return this.vendorsService.update(id, updateVendorDto);
  }

  @Put(':id/approve')
  @Roles('admin')
  async approve(@Param('id') id: number) {
    return this.vendorsService.approve(id);
  }

  @Put(':id/reject')
  @Roles('admin')
  async reject(@Param('id') id: number) {
    return this.vendorsService.reject(id);
  }

  @Delete(':id')
  @Roles('admin', 'vendor')
  async delete(@Param('id') id: number) {
    return this.vendorsService.delete(id);
  }
}