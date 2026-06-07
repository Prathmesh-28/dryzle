import { IsString, IsOptional, IsEnum, Matches, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class VerifyOtpDto {
  @ApiProperty()
  @IsString()
  @Matches(/^\+[1-9]\d{9,14}$/)
  phone: string;

  @ApiProperty()
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fcmToken?: string;
}
