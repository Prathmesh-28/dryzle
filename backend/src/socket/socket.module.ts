import { Module } from '@nestjs/common';
import { OrdersGateway } from './gateways/orders.gateway';
import { DeliveryGateway } from './gateways/delivery.gateway';

@Module({
  providers: [OrdersGateway, DeliveryGateway],
  exports: [OrdersGateway, DeliveryGateway],
})
export class SocketModule {}
