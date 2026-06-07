import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType, Prisma } from '@prisma/client';

interface NotificationPayload {
  title: string;
  body: string;
  type: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async sendToUser(userId: string, payload: NotificationPayload) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    await this.prisma.notification.create({
      data: {
        userId,
        title: payload.title,
        body: payload.body,
        type: payload.type as NotificationType,
        metadata: (payload.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    if (user.fcmToken) {
      this.sendFcmPush(user.fcmToken, payload.title, payload.body).catch((err) =>
        this.logger.error('FCM push failed', err),
      );
    }
  }

  async findAll(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async markRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  private async sendFcmPush(token: string, title: string, body: string) {
    this.logger.log(`FCM → ${token.slice(0, 12)}… | ${title}: ${body}`);
    // TODO: firebase-admin messaging().send({ token, notification: { title, body } })
  }
}
