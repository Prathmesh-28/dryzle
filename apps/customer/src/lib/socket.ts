import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      auth: {
        token: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '',
      },
    });
  }
  return socket;
}

export function joinOrderRoom(orderId: string) {
  const s = getSocket();
  if (!s.connected) s.connect();
  s.emit('join:order', orderId);
}

export function leaveOrderRoom(orderId: string) {
  getSocket().emit('leave:order', orderId);
}

export function onOrderStatus(cb: (data: { orderId: string; status: string }) => void) {
  getSocket().on('order:status', cb);
  return () => getSocket().off('order:status', cb);
}

export function onLocationUpdate(
  cb: (data: { orderId: string; lat: number; lng: number }) => void,
) {
  getSocket().on('location:update', cb);
  return () => getSocket().off('location:update', cb);
}
