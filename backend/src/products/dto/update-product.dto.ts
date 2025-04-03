import { IsOptional, IsNumber, IsEnum } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsEnum(['physical', 'digital', 'subscription'])
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsOptional()
  subcategoryId?: number;
}