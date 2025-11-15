// backend/services/RealtimeService.js

export const RealtimeService = {
  /**
   * Broadcasts an event to all connected clients.
   */
  emit({ eventName, payload }) {
    io.emit(eventName, payload);
  },

  /**
   * Emits an event to a specific user (requires userId => socketId mapping).
   */
  emitToUser({ userId, eventName, payload }) {
    const socketId = userSocketMap.get(userId);
    if (socketId) io.to(socketId).emit(eventName, payload);
  }
};
