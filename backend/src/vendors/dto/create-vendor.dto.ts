import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEmail, IsPhoneNumber } from 'class-validator';

export class CreateVendorDto {
  @IsNotEmpty()
  @IsString()
  name: string;

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
  // @IsPhoneNumber() // Validates phone number format (e.g., +12345678901)
  businessContact?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsNumber()
  userId: number;

  @IsNumber()
  categoryId: number;
}