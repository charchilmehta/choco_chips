/**
 * Socket Handler
 * Manages real-time WebRTC video call signaling and in-call chat
 * using Socket.IO.
 *
 * How WebRTC works (simplified):
 * 1. Both peers join the same room using roomId
 * 2. One peer sends an 'offer' (SDP)
 * 3. The other responds with an 'answer' (SDP)
 * 4. Both exchange ICE candidates for NAT traversal
 * 5. Video call is established peer-to-peer
 */

/**
 * Initialize Socket.IO event handlers.
 * @param {import('socket.io').Server} io - The Socket.IO server instance
 */
const socketHandler = (io) => {
  /**
   * Map to track which sockets are in which video rooms
   * Structure: { roomId: Set<socketId> }
   */
  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    /**
     * Event: 'join-room'
     * A patient or doctor joins a video call room using the appointment's videoRoomId.
     */
    socket.on('join-room', (roomId) => {
      // Create the room if it doesn't exist yet
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }

      const room = rooms.get(roomId);

      // Limit rooms to 2 participants (doctor + patient)
      if (room.size >= 2) {
        socket.emit('room-full', { message: 'Room is full. Max 2 participants allowed.' });
        return;
      }

      // Add this socket to the room
      room.add(socket.id);
      socket.join(roomId);
      socket.roomId = roomId; // Remember which room this socket is in

      console.log(`👥 Socket ${socket.id} joined room: ${roomId} (${room.size}/2 participants)`);

      // Notify others in the room that a new peer has joined
      socket.to(roomId).emit('user-joined', { socketId: socket.id });

      // Tell the joining user how many people are in the room
      socket.emit('room-joined', { roomId, participants: room.size });
    });

    /**
     * Event: 'offer'
     * The initiating peer sends an SDP offer to start the call.
     * We forward it to the other peer in the room.
     */
    socket.on('offer', ({ roomId, offer }) => {
      socket.to(roomId).emit('offer', { offer, from: socket.id });
    });

    /**
     * Event: 'answer'
     * The receiving peer responds with an SDP answer.
     * We forward it back to the initiator.
     */
    socket.on('answer', ({ roomId, answer }) => {
      socket.to(roomId).emit('answer', { answer, from: socket.id });
    });

    /**
     * Event: 'ice-candidate'
     * Both peers exchange ICE candidates to find the best connection path.
     */
    socket.on('ice-candidate', ({ roomId, candidate }) => {
      socket.to(roomId).emit('ice-candidate', { candidate, from: socket.id });
    });

    /**
     * Event: 'chat-message'
     * Send a text message to everyone else in the video call room.
     */
    socket.on('chat-message', ({ roomId, message, senderName }) => {
      // Broadcast to everyone else in the room
      socket.to(roomId).emit('chat-message', {
        message,
        senderName,
        from: socket.id,
        timestamp: new Date().toISOString(),
      });
    });

    /**
     * Event: 'leave-room'
     * User voluntarily leaves the video call room.
     */
    socket.on('leave-room', (roomId) => {
      handleLeaveRoom(socket, roomId);
    });

    /**
     * Event: 'end-call'
     * End the call for everyone in the room.
     */
    socket.on('end-call', (roomId) => {
      // Notify everyone in the room that the call has ended
      io.to(roomId).emit('call-ended', { endedBy: socket.id });

      // Clean up the room
      handleLeaveRoom(socket, roomId);
    });

    /**
     * Handle socket disconnection (browser closed, network lost, etc.)
     */
    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);

      // If the socket was in a room, notify others
      if (socket.roomId) {
        handleLeaveRoom(socket, socket.roomId);
      }
    });
  });

  /**
   * Helper: Remove a socket from its room and notify other participants.
   * @param {import('socket.io').Socket} socket
   * @param {string} roomId
   */
  const handleLeaveRoom = (socket, roomId) => {
    if (!rooms.has(roomId)) return;

    const room = rooms.get(roomId);
    room.delete(socket.id);
    socket.leave(roomId);

    console.log(`🚪 Socket ${socket.id} left room: ${roomId} (${room.size} remaining)`);

    // Notify remaining participants
    socket.to(roomId).emit('user-left', { socketId: socket.id });

    // Clean up empty rooms
    if (room.size === 0) {
      rooms.delete(roomId);
      console.log(`🗑️ Room ${roomId} deleted (empty)`);
    }
  };
};

module.exports = socketHandler;
