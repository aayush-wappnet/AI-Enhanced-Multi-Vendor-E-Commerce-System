import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
export function configureCloudinary() {
  const configService = new ConfigService();
  console.log('Cloudinary Config:', {
    cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
    api_key: configService.get('CLOUDINARY_API_KEY'),
    api_secret: configService.get('CLOUDINARY_API_SECRET'),
  });
  cloudinary.config({
    cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
    api_key: configService.get('CLOUDINARY_API_KEY'),
    api_secret: configService.get('CLOUDINARY_API_SECRET'),
  });
}