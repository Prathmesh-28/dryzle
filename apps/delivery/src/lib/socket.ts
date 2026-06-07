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

export function startLocationSharing(orderId: string, deliveryBoyId: string) {
  const s = getSocket();
  if (!s.connected) s.connect();

  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      s.emit('location:update', {
        orderId,
        deliveryBoyId,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    },
    (err) => console.error('Geolocation error:', err),
    { enableHighAccuracy: true, maximumAge: 5000 },
  );

  return () => navigator.geolocation.clearWatch(watchId);
}
