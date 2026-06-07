import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NearbyVendorsDto {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  lat: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  lng: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  service?: string;
}
