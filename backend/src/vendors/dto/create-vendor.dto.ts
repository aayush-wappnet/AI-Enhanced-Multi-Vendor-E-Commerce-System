import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateVendorDto {
  @IsNotEmpty()
  name: string; // Store name

  @IsOptional()
  description?: string; // Store description

  @IsNumber()
  userId: number; // The user creating the vendor store

  @IsNumber()
  categoryId: number; // The category this vendor store specializes in
}