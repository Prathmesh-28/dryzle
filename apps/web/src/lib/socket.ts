import { io, type Socket } from "socket.io-client";
import { getToken } from "./auth";

const SOCKET_URL = "https://dryzle-api.onrender.com";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token: getToken() },
      autoConnect: true,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
