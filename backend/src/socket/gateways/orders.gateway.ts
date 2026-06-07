import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/',
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrdersGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:order')
  handleJoinOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() orderId: string,
  ) {
    client.join(`order:${orderId}`);
  }

  @SubscribeMessage('leave:order')
  handleLeaveOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() orderId: string,
  ) {
    client.leave(`order:${orderId}`);
  }

  emitOrderStatusUpdate(orderId: string, status: string, data: Record<string, unknown>) {
    this.server.to(`order:${orderId}`).emit('order:status', { orderId, status, ...data });
  }

  emitNewOrderToVendor(vendorId: string, order: Record<string, unknown>) {
    this.server.to(`vendor:${vendorId}`).emit('order:new', order);
  }

  emitNewOrderToDeliveryBoy(deliveryBoyId: string, order: Record<string, unknown>) {
    this.server.to(`db:${deliveryBoyId}`).emit('order:assigned', order);
  }
}
