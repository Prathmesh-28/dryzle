import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVendorDto {
  @ApiProperty()
  @IsString()
  shopName: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsNumber()
  geoLat: number;

  @ApiProperty()
  @IsNumber()
  geoLng: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  serviceRadiusKm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankUpi?: string;
}
