import { io } from 'socket.io-client';

// Connect to WebSocket server via proxy or explicit URL
export const socket = io({
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});
