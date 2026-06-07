import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface LocationUpdate {
  orderId: string;
  lat: number;
  lng: number;
  deliveryBoyId: string;
}

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/',
})
export class DeliveryGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join:vendor')
  handleJoinVendor(@ConnectedSocket() client: Socket, @MessageBody() vendorId: string) {
    client.join(`vendor:${vendorId}`);
  }

  @SubscribeMessage('join:db')
  handleJoinDeliveryBoy(@ConnectedSocket() client: Socket, @MessageBody() deliveryBoyId: string) {
    client.join(`db:${deliveryBoyId}`);
  }

  @SubscribeMessage('location:update')
  handleLocationUpdate(@MessageBody() payload: LocationUpdate) {
    this.server
      .to(`order:${payload.orderId}`)
      .emit('location:update', payload);
  }
}
