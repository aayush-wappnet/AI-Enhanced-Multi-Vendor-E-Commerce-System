import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { configureCloudinary } from './config/cloudinary.config';

async function bootstrap() {
  configureCloudinary(); // Initialize Cloudinary
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true })); // Enable transformation globally
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
    credentials: true,
  });
  app.setGlobalPrefix('api/');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();