import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('intent')
  @Roles('customer')
  async createPaymentIntent(@Body() body: { orderId: number; amount: number }) {
    return this.paymentsService.createPaymentIntent(body.orderId, body.amount);
  }

  @Post('confirm')
  @Roles('customer')
  async confirmPayment(@Body() body: { orderId: number; paymentIntentId: string }) {
    return this.paymentsService.confirmPayment(body.orderId, body.paymentIntentId);
  }
}