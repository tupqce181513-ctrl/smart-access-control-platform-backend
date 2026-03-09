const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

class WebSocketService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // Maps userId to an array of socketIds
  }

  /**
   * Initialize Socket.IO server
   * @param {Object} server - HTTP Server instance
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Middleware for authentication
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth?.token;
        if (!token) {
          return next(new Error('Authentication error: Token missing'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded; // Attach user info to socket
        next();
      } catch (err) {
        return next(new Error('Authentication error: Invalid token'));
      }
    });

    // Connection handling
    this.io.on('connection', (socket) => {
      const userId = socket.user.userId;
      console.log(`✓ Client connected to WebSocket: user ${userId} (socket ${socket.id})`);

      // Add socket to user's list of active sockets
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(socket.id);

      socket.on('disconnect', () => {
        console.log(`✓ Client disconnected from WebSocket: user ${userId} (socket ${socket.id})`);
        
        // Remove socket from user's active sockets
        const userSocks = this.userSockets.get(userId);
        if (userSocks) {
          userSocks.delete(socket.id);
          if (userSocks.size === 0) {
            this.userSockets.delete(userId);
          }
        }
      });
    });

    console.log('✓ WebSocket server initialized');
  }

  /**
   * Emit an event to a specific user (all their active connections)
   * @param {string} userId - User ID to emit to
   * @param {string} event - Event name
   * @param {any} data - Data payload
   */
  emitToUser(userId, event, data) {
    if (!this.io) return;
    
    // Ensure userId is string for Map lookup
    const userIdStr = userId.toString();
    const userSocks = this.userSockets.get(userIdStr);
    
    if (userSocks && userSocks.size > 0) {
      Array.from(userSocks).forEach(socketId => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }

  /**
   * Emit an event to all connected users
   * @param {string} event - Event name
   * @param {any} data - Data payload
   */
  emitToAll(event, data) {
    if (!this.io) return;
    this.io.emit(event, data);
  }
}

// Export singleton instance
module.exports = new WebSocketService();
