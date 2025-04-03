import { IsNotEmpty, IsNumber, IsEnum, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNumber()
  price: number;

  @IsNumber()
  stock: number;

  @IsEnum(['physical', 'digital', 'subscription'])
  type: string;

  @IsNumber()
  vendorId: number;

  @IsNumber()
  categoryId: number;

  @IsNumber()
  @IsOptional()
  subcategoryId?: number;
}