import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ValidatePromoDto } from './dto/validate-promo.dto';
import { CreatePromoDto } from './dto/create-promo.dto';

@Injectable()
export class PromosService {
  constructor(private prisma: PrismaService) {}

  async validate(dto: ValidatePromoDto) {
    const promo = await this.prisma.promoCode.findFirst({
      where: {
        code: dto.code.toUpperCase(),
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (!promo) throw new BadRequestException('Invalid or expired promo code');
    if (promo.usedCount >= promo.maxUses) {
      throw new BadRequestException('Promo code usage limit reached');
    }
    if (dto.subtotal < promo.minOrder) {
      throw new BadRequestException(`Minimum order of ₹${promo.minOrder} required`);
    }

    const discount =
      promo.discountType === 'PERCENTAGE'
        ? (dto.subtotal * promo.discountValue) / 100
        : promo.discountValue;

    const cappedDiscount = Math.min(discount, dto.subtotal);

    return {
      valid: true,
      promoCode: promo,
      discount: cappedDiscount,
      finalAmount: dto.subtotal - cappedDiscount,
    };
  }

  async create(dto: CreatePromoDto) {
    return this.prisma.promoCode.create({
      data: { ...dto, code: dto.code.toUpperCase() },
    });
  }

  async findAll() {
    return this.prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
