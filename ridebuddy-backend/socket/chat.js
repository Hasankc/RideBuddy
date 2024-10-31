const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');

function initializeSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.user.id;
      
      // Update user's online status
      await User.findByIdAndUpdate(decoded.user.id, {
        lastActive: new Date(),
        isOnline: true
      });

      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log('User connected:', socket.userId);

    // Join personal room
    socket.join(socket.userId);

    // Handle joining chat rooms
    socket.on('join_chat', async (matchId) => {
      socket.join(matchId);
      
      // Mark messages as read
      await Message.updateMany(
        {
          matchId,
          receiverId: socket.userId,
          read: false
        },
        { read: true }
      );

      // Notify other user that messages were read
      socket.to(matchId).emit('messages_read', { matchId });
    });

    // Handle new messages
    socket.on('send_message', async (data) => {
      try {
        const { matchId, receiverId, content } = data;

        // Create and save message
        const message = new Message({
          matchId,
          senderId: socket.userId,
          receiverId,
          content,
          timestamp: new Date(),
          read: false
        });

        await message.save();

        // Emit to both users
        io.to(matchId).emit('new_message', {
          ...message.toJSON(),
          sender: await User.findById(socket.userId).select('name profile.images')
        });

        // Send notification if receiver is not in the chat
        const receiverSocket = io.sockets.adapter.rooms.get(receiverId);
        if (!receiverSocket?.has(matchId)) {
          io.to(receiverId).emit('message_notification', {
            matchId,
            senderId: socket.userId,
            content
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', ({ matchId }) => {
      socket.to(matchId).emit('typing_indicator', {
        userId: socket.userId,
        isTyping: true
      });
    });

    socket.on('typing_stop', ({ matchId }) => {
      socket.to(matchId).emit('typing_indicator', {
        userId: socket.userId,
        isTyping: false
      });
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.userId);
      
      // Update user's online status
      await User.findByIdAndUpdate(socket.userId, {
        lastActive: new Date(),
        isOnline: false
      });
    });
  });

  return io;
}

module.exports = initializeSocket;