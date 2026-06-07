import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VehicleType } from '@prisma/client';

export class CreateDeliveryBoyDto {
  @ApiProperty()
  @IsString()
  vendorId: string;

  @ApiProperty({ enum: VehicleType })
  @IsEnum(VehicleType)
  vehicleType: VehicleType;
}
