import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersGateway } from '../../socket/gateways/orders.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus, Role, User } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private ordersGateway: OrdersGateway,
    private notificationsService: NotificationsService,
  ) {}

  async create(customerId: string, dto: CreateOrderDto) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: dto.vendorId },
      include: { user: true },
    });
    if (!vendor || !vendor.isOpen) throw new BadRequestException('Vendor not available');

    const settings = await this.prisma.platformSettings.findUnique({
      where: { id: 'singleton' },
    });
    const commissionRate = vendor.commissionRate ?? settings?.commissionRate ?? 0.18;

    let discount = 0;
    let promoCodeId: string | undefined;
    if (dto.promoCode) {
      const promo = await this.prisma.promoCode.findFirst({
        where: {
          code: dto.promoCode.toUpperCase(),
          isActive: true,
          expiresAt: { gt: new Date() },
        },
      });
      if (promo && dto.subtotal >= promo.minOrder && promo.usedCount < promo.maxUses) {
        discount =
          promo.discountType === 'PERCENTAGE'
            ? (dto.subtotal * promo.discountValue) / 100
            : promo.discountValue;
        promoCodeId = promo.id;
        await this.prisma.promoCode.update({
          where: { id: promo.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    const totalAmount = dto.subtotal - discount;
    const platformFee = totalAmount * commissionRate;
    const vendorPayout = totalAmount - platformFee;
    const dbPayout = settings?.dbPayPerDelivery ?? 30;

    const order = await this.prisma.order.create({
      data: {
        customerId,
        vendorId: dto.vendorId,
        totalAmount,
        pickupSlot: dto.pickupSlot,
        deliverySlot: dto.deliverySlot,
        notes: dto.notes,
        promoCodeId,
        platformFee,
        vendorPayout,
        dbPayout,
        items: {
          create: dto.items.map((item) => ({
            serviceId: item.serviceId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice,
          })),
        },
        statusLogs: {
          create: { status: OrderStatus.PLACED, updatedByRole: Role.CUSTOMER },
        },
      },
      include: { items: true },
    });

    this.ordersGateway.emitNewOrderToVendor(
      dto.vendorId,
      order as unknown as Record<string, unknown>,
    );
    await this.notificationsService.sendToUser(vendor.user.id, {
      title: 'New Order!',
      body: `Order #${order.id.slice(-6)} received`,
      type: 'ORDER',
    });

    return order;
  }

  async findAllForUser(user: User, page: number, limit: number) {
    const skip = (page - 1) * limit;
    let where: Record<string, unknown> = {};

    if (user.role === Role.CUSTOMER) {
      where = { customerId: user.id };
    } else if (user.role === Role.VENDOR) {
      const vendor = await this.prisma.vendor.findUnique({ where: { userId: user.id } });
      if (!vendor) return { data: [], total: 0, page, limit, totalPages: 0 };
      where = { vendorId: vendor.id };
    } else if (user.role === Role.DELIVERY_BOY) {
      const db = await this.prisma.deliveryBoy.findUnique({ where: { userId: user.id } });
      if (!db) return { data: [], total: 0, page, limit, totalPages: 0 };
      where = { deliveryBoyId: db.id };
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { service: true } },
          vendor: true,
          deliveryBoy: { include: { user: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { service: true } },
        statusLogs: { orderBy: { timestamp: 'asc' } },
        payment: true,
        vendor: true,
        deliveryBoy: { include: { user: true } },
        review: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, user: User, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException();

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.deliveryBoyId && { deliveryBoyId: dto.deliveryBoyId }),
        statusLogs: {
          create: { status: dto.status, updatedByRole: user.role, notes: dto.notes },
        },
      },
    });

    this.ordersGateway.emitOrderStatusUpdate(id, dto.status, {
      updatedBy: user.role,
    });

    await this.notificationsService.sendToUser(order.customerId, {
      title: 'Order Update',
      body: `Your order is now: ${dto.status.replace(/_/g, ' ')}`,
      type: 'ORDER',
    });

    if (dto.status === OrderStatus.READY) {
      await this.autoAssignDeliveryBoy(updated);
    }

    return updated;
  }

  async cancel(id: string, userId: string, reason?: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException();
    if (!['PLACED', 'ACCEPTED'].includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
        cancelReason: reason,
        statusLogs: {
          create: {
            status: OrderStatus.CANCELLED,
            updatedByRole: Role.CUSTOMER,
            notes: reason,
          },
        },
      },
    });
  }

  private async autoAssignDeliveryBoy(order: { id: string; vendorId: string }) {
    const db = await this.prisma.deliveryBoy.findFirst({
      where: { vendorId: order.vendorId, isAvailable: true, isApproved: true },
    });
    if (!db) return;

    await this.prisma.order.update({
      where: { id: order.id },
      data: { deliveryBoyId: db.id },
    });

    this.ordersGateway.emitNewOrderToDeliveryBoy(db.id, {
      orderId: order.id,
    } as Record<string, unknown>);
  }
}
