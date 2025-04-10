import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InferenceClient } from '@huggingface/inference';

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string | undefined;
    };
  }>;
}

// Define interfaces based on your entities
interface Product {
  id: number;
  name: string; // Add other fields if needed
  price: number;
}

interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  orderItems: OrderItem[];
}

@Injectable()
export class ChatbotService {
  private readonly hf: InferenceClient;

  constructor(private configService: ConfigService) {
    const apiToken = this.configService.get<string>('HF_API_TOKEN');
    if (!apiToken) {
      throw new Error('Hugging Face API token is not configured in .env or lacks Pro access');
    }
    this.hf = new InferenceClient(apiToken);
  }

  async getChatbotResponse(message: string, orders: Order[]): Promise<string> {
    try {
      // Prepare order context for all orders
      let orderContext = '';
      if (orders.length > 0) {
        orderContext = `The user has the following orders:\n${orders
          .map(order => {
            const itemDetails = order.orderItems.length > 0
              ? `Items: ${order.orderItems.map(item => `${item.quantity} x ${item.product.name} (@$${item.price} each)`).join('; ')}`
              : 'No item details available.';
            return `Order #${order.id}: Status: ${order.status}, Total: $${order.totalAmount}, ${itemDetails}, Placed on: ${order.createdAt.toISOString().split('T')[0]}`;
          })
          .join('\n')}. Use this information to assist with order-related queries.`;
      } else {
        orderContext = 'You have no orders currently.';
      }

      const systemContext = `You are a customer support chatbot for an e-commerce platform. Assist with order queries, product info, and general support. ${orderContext} If the user asks about order status or details, provide information based on the available orders, or inform them if no orders exist.`;

      const response = await this.hf.chatCompletion({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages: [
          { 
            role: 'system', 
            content: systemContext 
          },
          { role: 'user', content: message },
        ],
        max_tokens: 300, // Sufficient for detailed responses
      }) as ChatCompletionResponse;

      const content = response.choices[0]?.message?.content || 'No response from AI.';
      console.log('Chatbot response:', content); // Debug log
      return content;
    } catch (error) {
      console.error('Chatbot error details:', error); // Log the full error
      return 'Sorry, I couldn’t process your request right now.';
    }
  }
}