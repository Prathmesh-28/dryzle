import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDeliveryBoyDto } from './dto/create-delivery-boy.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

  async register(userId: string, dto: CreateDeliveryBoyDto) {
    return this.prisma.deliveryBoy.create({ data: { ...dto, userId } });
  }

  async getProfile(userId: string) {
    const db = await this.prisma.deliveryBoy.findUnique({
      where: { userId },
      include: { vendor: true },
    });
    if (!db) throw new NotFoundException('Delivery boy not found');
    return db;
  }

  async toggleAvailability(userId: string) {
    const db = await this.prisma.deliveryBoy.findUnique({ where: { userId } });
    if (!db) throw new NotFoundException();
    return this.prisma.deliveryBoy.update({
      where: { userId },
      data: { isAvailable: !db.isAvailable },
    });
  }

  async getAssignedOrders(userId: string) {
    const db = await this.prisma.deliveryBoy.findUnique({ where: { userId } });
    if (!db) throw new NotFoundException();
    return this.prisma.order.findMany({
      where: {
        deliveryBoyId: db.id,
        status: { in: [OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY] },
      },
      include: {
        items: { include: { service: true } },
        vendor: true,
        customer: { select: { name: true, phone: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getEarnings(userId: string) {
    const db = await this.prisma.deliveryBoy.findUnique({ where: { userId } });
    if (!db) throw new NotFoundException();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [todayCount, weekCount] = await Promise.all([
      this.prisma.order.count({
        where: { deliveryBoyId: db.id, status: OrderStatus.DELIVERED, updatedAt: { gte: today } },
      }),
      this.prisma.order.count({
        where: { deliveryBoyId: db.id, status: OrderStatus.DELIVERED, updatedAt: { gte: weekAgo } },
      }),
    ]);

    const settings = await this.prisma.platformSettings.findUnique({
      where: { id: 'singleton' },
    });
    const payPerDelivery = settings?.dbPayPerDelivery ?? 30;

    return {
      totalEarnings: db.totalEarnings,
      todayDeliveries: todayCount,
      todayEarnings: todayCount * payPerDelivery,
      weekDeliveries: weekCount,
      weekEarnings: weekCount * payPerDelivery,
      payPerDelivery,
    };
  }
}
