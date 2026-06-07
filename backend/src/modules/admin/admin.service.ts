import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, OrderStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [
      ordersToday,
      activeOrders,
      cancelledToday,
      vendorCount,
      activeVendors,
      deliveryBoyCount,
      onDutyDBs,
      newUsersWeek,
      gmvToday,
      gmvWeek,
      gmvMonth,
    ] = await Promise.all([
      this.prisma.order.count({ where: { createdAt: { gte: today } } }),
      this.prisma.order.count({
        where: { status: { notIn: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] } },
      }),
      this.prisma.order.count({
        where: { status: OrderStatus.CANCELLED, updatedAt: { gte: today } },
      }),
      this.prisma.vendor.count(),
      this.prisma.vendor.count({ where: { isActive: true, isApproved: true } }),
      this.prisma.deliveryBoy.count(),
      this.prisma.deliveryBoy.count({ where: { isAvailable: true } }),
      this.prisma.user.count({ where: { role: Role.CUSTOMER, createdAt: { gte: weekAgo } } }),
      this.prisma.order.aggregate({
        where: { createdAt: { gte: today }, status: OrderStatus.DELIVERED },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.aggregate({
        where: { createdAt: { gte: weekAgo }, status: OrderStatus.DELIVERED },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.aggregate({
        where: { createdAt: { gte: monthAgo }, status: OrderStatus.DELIVERED },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      ordersToday,
      activeOrders,
      cancelledToday,
      vendorCount,
      activeVendors,
      deliveryBoyCount,
      onDutyDeliveryBoys: onDutyDBs,
      newUsersThisWeek: newUsersWeek,
      gmvToday: gmvToday._sum.totalAmount ?? 0,
      gmvWeek: gmvWeek._sum.totalAmount ?? 0,
      gmvMonth: gmvMonth._sum.totalAmount ?? 0,
    };
  }

  async getUsers(page: number, role?: Role) {
    const limit = 20;
    const skip = (page - 1) * limit;
    const where = role ? { role } : {};
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async banUser(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async getVendors(page: number, approved?: boolean) {
    const limit = 20;
    const skip = (page - 1) * limit;
    const where = approved !== undefined ? { isApproved: approved } : {};
    const [data, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { name: true, phone: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vendor.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async approveVendor(id: string) {
    return this.prisma.vendor.update({ where: { id }, data: { isApproved: true } });
  }

  async suspendVendor(id: string) {
    return this.prisma.vendor.update({
      where: { id },
      data: { isActive: false, isOpen: false },
    });
  }

  async getDeliveryBoys(page: number) {
    const limit = 20;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.deliveryBoy.findMany({
        skip,
        take: limit,
        include: {
          user: { select: { name: true, phone: true } },
          vendor: { select: { shopName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.deliveryBoy.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async approveDeliveryBoy(id: string) {
    return this.prisma.deliveryBoy.update({ where: { id }, data: { isApproved: true } });
  }

  async getOrders(page: number, status?: string, date?: string) {
    const limit = 20;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where.createdAt = { gte: d, lt: next };
    }
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: { select: { name: true, phone: true } },
          vendor: { select: { shopName: true } },
          deliveryBoy: { include: { user: { select: { name: true, phone: true } } } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async reassignDeliveryBoy(orderId: string, deliveryBoyId: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { deliveryBoyId },
    });
  }

  async broadcastNotification(title: string, body: string, role?: Role) {
    const where = role ? { role } : {};
    const users = await this.prisma.user.findMany({ where, select: { id: true } });
    await this.prisma.notification.createMany({
      data: users.map((u) => ({ userId: u.id, title, body, type: 'SYSTEM' as const })),
    });
    return { sent: users.length };
  }

  async getSettings() {
    return this.prisma.platformSettings.upsert({
      where: { id: 'singleton' },
      update: {},
      create: { id: 'singleton' },
    });
  }

  async updateSettings(data: Record<string, unknown>) {
    return this.prisma.platformSettings.upsert({
      where: { id: 'singleton' },
      update: data,
      create: { id: 'singleton', ...data },
    });
  }
}
