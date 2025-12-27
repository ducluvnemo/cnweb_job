import io from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class SocketManager {
  constructor() {
    this.socket = null;
    this.listeners = new Map(); // Store listeners for cleanup
  }

  connect(userId) {
    if (this.socket?.connected) {
      // If already connected, just emit join event
      this.socket.emit('join', userId);
      return;
    }

    this.socket = io(SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.socket.emit('join', userId);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  disconnect() {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
  }

  sendMessage(data) {
    if (this.socket?.connected) {
      this.socket.emit('send_message', data);
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.off('receive_message'); // Remove old listener
      this.socket.on('receive_message', callback);
    }
  }

  onMessageSent(callback) {
    if (this.socket) {
      this.socket.off('message_sent'); // Remove old listener
      this.socket.on('message_sent', callback);
    }
  }

  onError(callback) {
    if (this.socket) {
      this.socket.off('error'); // Remove old listener
      this.socket.on('error', callback);
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export default new SocketManager();
