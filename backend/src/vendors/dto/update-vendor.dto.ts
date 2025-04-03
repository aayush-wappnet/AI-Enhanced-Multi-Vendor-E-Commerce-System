import { IsOptional, IsNumber } from 'class-validator';

export class UpdateVendorDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number;
}