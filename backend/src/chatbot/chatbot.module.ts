import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [ConfigModule.forRoot(),OrdersModule],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}