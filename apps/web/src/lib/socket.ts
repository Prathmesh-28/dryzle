import { io, Socket } from 'socket.io-client';
import { getToken } from './auth';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3001', {
      auth: { token: getToken() },
      transports: ['websocket'],
    });
  }
  return socket;
}

export function joinOrderRoom(orderId: string) {
  getSocket().emit('join:order', { orderId });
}

export function leaveOrderRoom(orderId: string) {
  getSocket().emit('leave:order', { orderId });
}

export function onOrderStatus(cb: (data: unknown) => void) {
  getSocket().on('order:status', cb);
  return () => getSocket().off('order:status', cb);
}

export function onLocationUpdate(cb: (data: unknown) => void) {
  getSocket().on('location:update', cb);
  return () => getSocket().off('location:update', cb);
}

export function startLocationSharing(orderId: string) {
  if (!navigator.geolocation) return () => {};
  const id = navigator.geolocation.watchPosition((pos) => {
    getSocket().emit('location:update', {
      orderId,
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    });
  });
  return () => navigator.geolocation.clearWatch(id);
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
