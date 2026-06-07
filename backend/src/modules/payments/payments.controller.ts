import { Controller, Post, Body, Param, UseGuards, Headers, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { User } from '@prisma/client';
import { Request } from 'express';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  initiate(@CurrentUser() user: User, @Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiatePayment(user.id, dto);
  }

  @Post('webhook/razorpay')
  handleWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Req() req: Request,
  ) {
    return this.paymentsService.handleWebhook(signature, req.body as Record<string, unknown>);
  }

  @Post(':orderId/refund')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  refund(@Param('orderId') orderId: string, @Body('reason') reason: string) {
    return this.paymentsService.initiateRefund(orderId, reason);
  }
}
