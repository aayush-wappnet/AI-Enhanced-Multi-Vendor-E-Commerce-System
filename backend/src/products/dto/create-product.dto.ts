import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsString() // Changed from @IsNumber() to accept string from form-data
  price: string;

  @IsString() // Changed from @IsNumber()
  stock: string;

  @IsEnum(['physical', 'digital', 'subscription'])
  type: string;

  @IsString() // Changed from @IsNumber()
  vendorId: string;

  @IsString() // Changed from @IsNumber()
  categoryId: string;

  @IsString() // Changed from @IsNumber()
  @IsOptional()
  subcategoryId?: string;
}