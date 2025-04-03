import { IsEmail, IsOptional, IsEnum } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsEnum(['admin', 'vendor', 'customer'])
  @IsOptional()
  role?: string;
}