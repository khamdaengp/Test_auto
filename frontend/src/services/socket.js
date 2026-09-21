import { io } from 'socket.io-client';

// Connect to backend WebSocket server directly on port 4000 in dev or via current origin in prod
const socketUrl =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? `http://${window.location.hostname}:4000`
    : undefined;

export const socket = io(socketUrl, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  transports: ['polling', 'websocket'],
});
