require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Attach io instance to Express app
app.set('io', io);

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join user-specific room
  socket.on('join', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined room user-${userId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO server ready for connections`);
});