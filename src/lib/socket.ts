import { io, type Socket } from 'socket.io-client';
import { URL } from '../constants';

/**
 * Single shared Socket.IO connection, authenticated by the same httpOnly cookie
 * the REST API uses (withCredentials). Created lazily on first use.
 */
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(URL, {
      withCredentials: true,
      path: '/socket.io',
      transports: ['websocket', 'polling'],
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
