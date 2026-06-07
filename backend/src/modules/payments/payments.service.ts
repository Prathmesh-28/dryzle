import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private prisma: PrismaService) {}

  async initiatePayment(userId: string, dto: InitiatePaymentDto) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new BadRequestException('Order not found');
    if (order.customerId !== userId) throw new BadRequestException('Unauthorized');

    // In production: create Razorpay order via SDK
    const gatewayOrderId = `order_${Date.now()}`;

    const payment = await this.prisma.payment.upsert({
      where: { orderId: dto.orderId },
      update: { gatewayOrderId, method: dto.method },
      create: {
        orderId: dto.orderId,
        amount: order.totalAmount,
        method: dto.method,
        gatewayOrderId,
      },
    });

    return {
      payment,
      razorpayOptions: {
        key: process.env.RAZORPAY_KEY_ID,
        amount: Math.round(order.totalAmount * 100),
        currency: 'INR',
        order_id: gatewayOrderId,
        notes: { orderId: dto.orderId },
      },
    };
  }

  async handleWebhook(signature: string, body: Record<string, unknown>) {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET ?? '')
      .update(JSON.stringify(body))
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = body.event as string;
    const payload = (body.payload as Record<string, unknown>)?.payment as Record<string, unknown>;
    const entity = payload?.entity as Record<string, unknown>;

    if (event === 'payment.captured' && entity) {
      const notes = entity.notes as Record<string, string>;
      const orderId = notes?.orderId;
      if (orderId) {
        await this.prisma.payment.update({
          where: { orderId },
          data: { status: PaymentStatus.PAID, gatewayTxnId: entity.id as string },
        });
        await this.prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: PaymentStatus.PAID },
        });
        this.logger.log(`Payment captured for order ${orderId}`);
      }
    }

    return { received: true };
  }

  async initiateRefund(orderId: string, reason: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment || payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException('Payment not eligible for refund');
    }

    this.logger.log(`Initiating refund for order ${orderId}: ${reason}`);
    // In production: call Razorpay refund API

    await this.prisma.payment.update({
      where: { orderId },
      data: { status: PaymentStatus.REFUNDED },
    });
    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: PaymentStatus.REFUNDED },
    });

    return { success: true, message: 'Refund initiated' };
  }
}
