import { IsOptional, IsNumber, IsString, IsEmail, IsPhoneNumber } from 'class-validator';

export class UpdateVendorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEmail()
  businessEmail?: string;

  @IsOptional()
  @IsPhoneNumber()
  businessContact?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsOptional()
  @IsString() // No need for status here as it's handled by approve/reject endpoints
  isActive?: boolean;

  @IsOptional()
  @IsString()
  status?: 'approved' | 'rejected' | 'pending'; // Optional for update, but not required
}