import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotRequestDto } from './dto/chatbot-request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'; // Adjust path if needed
import { OrdersService } from '../orders/orders.service'; // Adjust path if needed

@Controller('chatbot')
export class ChatbotController {
  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly ordersService: OrdersService,
  ) {}

  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  @Post()
  async chat(
    @Body() chatbotRequestDto: ChatbotRequestDto,
    @Request() req,
  ): Promise<{ response: string }> {
    const userId = req.user.id; // Extract user ID from JWT payload
    const orders = await this.ordersService.findByUserId(userId); // Fetch user's orders with orderItems
    const response = await this.chatbotService.getChatbotResponse(chatbotRequestDto.message, orders);
    return { response };
  }
}