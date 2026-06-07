import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { OtpService } from './otp.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OtpService,
  ) {}

  async sendOtp(phone: string) {
    await this.otpService.sendOtp(phone);
    return { message: 'OTP sent successfully' };
  }

  async verifyOtpAndLogin(dto: VerifyOtpDto) {
    const isValid = await this.otpService.verifyOtp(dto.phone, dto.code);
    if (!isValid) throw new UnauthorizedException('Invalid or expired OTP');

    let user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone: dto.phone,
          name: dto.name ?? 'New User',
          role: dto.role ?? Role.CUSTOMER,
        },
      });
    }

    if (dto.fcmToken) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { fcmToken: dto.fcmToken },
      });
    }

    const tokens = this.generateTokens(user.id, user.role, user.phone);
    return { user, ...tokens };
  }

  async loginWithEmail(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    const tokens = this.generateTokens(user.id, user.role, user.phone);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException();
      return this.generateTokens(user.id, user.role, user.phone);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(userId: string, role: Role, phone: string) {
    const payload = { sub: userId, role, phone };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '30d',
    });
    return { accessToken, refreshToken };
  }
}
