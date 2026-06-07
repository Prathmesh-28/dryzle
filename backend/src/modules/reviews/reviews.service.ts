import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(customerId: string, dto: CreateReviewDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { review: true },
    });
    if (!order || order.customerId !== customerId) {
      throw new BadRequestException('Invalid order');
    }
    if (order.status !== 'DELIVERED') {
      throw new BadRequestException('Order not yet delivered');
    }
    if (order.review) {
      throw new BadRequestException('Review already submitted for this order');
    }

    const review = await this.prisma.review.create({
      data: {
        orderId: dto.orderId,
        customerId,
        vendorId: order.vendorId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });

    const { _avg, _count } = await this.prisma.review.aggregate({
      where: { vendorId: order.vendorId, isFlagged: false },
      _avg: { rating: true },
      _count: true,
    });

    await this.prisma.vendor.update({
      where: { id: order.vendorId },
      data: { rating: _avg.rating ?? 0, reviewCount: _count },
    });

    return review;
  }

  async findByVendor(vendorId: string, page: number) {
    const limit = 20;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { vendorId, isFlagged: false },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { customer: { select: { name: true } } },
      }),
      this.prisma.review.count({ where: { vendorId, isFlagged: false } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async flag(id: string) {
    return this.prisma.review.update({ where: { id }, data: { isFlagged: true } });
  }
}
