import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { SocketModule } from '../../socket/socket.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [SocketModule, NotificationsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
