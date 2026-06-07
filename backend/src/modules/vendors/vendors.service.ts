import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NearbyVendorsDto } from './dto/nearby-vendors.dto';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async findNearby(query: NearbyVendorsDto) {
    const vendors = await this.prisma.vendor.findMany({
      where: { isApproved: true, isActive: true },
      include: { services: { where: { isActive: true } } },
      orderBy: { rating: 'desc' },
    });

    return vendors
      .map((v) => ({
        ...v,
        distanceKm: this.haversineKm(query.lat, query.lng, v.geoLat, v.geoLng),
      }))
      .filter((v) => v.distanceKm <= v.serviceRadiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  async findById(id: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        services: { where: { isActive: true } },
        reviews: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async create(userId: string, dto: CreateVendorDto) {
    return this.prisma.vendor.create({ data: { ...dto, userId } });
  }

  async updateByUserId(userId: string, dto: UpdateVendorDto) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException();
    return this.prisma.vendor.update({ where: { userId }, data: dto });
  }

  async toggleOpen(userId: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException();
    return this.prisma.vendor.update({
      where: { userId },
      data: { isOpen: !vendor.isOpen },
    });
  }

  async getServices(userId: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException();
    return this.prisma.service.findMany({ where: { vendorId: vendor.id } });
  }

  async addService(userId: string, dto: CreateServiceDto) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException();
    return this.prisma.service.create({ data: { ...dto, vendorId: vendor.id } });
  }

  private haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
