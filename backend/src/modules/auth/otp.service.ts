import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(private prisma: PrismaService) {}

  async sendOtp(phone: string): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.otpCode.updateMany({
      where: { phone, isUsed: false },
      data: { isUsed: true },
    });

    await this.prisma.otpCode.create({ data: { phone, code, expiresAt } });

    // In production: send via Twilio/MSG91
    this.logger.log(`OTP for ${phone}: ${code}`);
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const otp = await this.prisma.otpCode.findFirst({
      where: { phone, code, isUsed: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) return false;

    await this.prisma.otpCode.update({ where: { id: otp.id }, data: { isUsed: true } });
    return true;
  }
}
