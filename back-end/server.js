require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// ROUTES
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require('./routes/userRoutes');

// APP
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
  res.send('✅ Virtual Classroom API is running');
});

// DATABASE
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// --- SOCKET.IO LOGIC ---

// Otaqdakı istifadəçiləri saxlayan obyekt
const roomUsers = {};

// CONNECTION
io.on('connection', (socket) => {
  console.log(`🟢 User connected: ${socket.id}`);

  // İstifadəçi otağa qoşulur
  socket.on('join-room', ({ roomId, username, avatar }) => {
    console.log(`✅ ${username} joined room ${roomId}`);
    socket.join(roomId);

    if (!roomUsers[roomId]) roomUsers[roomId] = [];
    roomUsers[roomId].push({ username, socketId: socket.id });

    io.to(roomId).emit('room-users', roomUsers[roomId]);
    socket.to(roomId).emit('user-joined', { username, socketId: socket.id });
  });

  // WebRTC events
  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', data);
  });

  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', data);
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', data);
  });

  // Whiteboard draw event
  socket.on('draw', ({ roomId, x0, y0, x1, y1, color, lineWidth }) => {
    socket.to(roomId).emit('draw', { x0, y0, x1, y1, color, lineWidth });
  });

  // Whiteboard clear (silgi) event
  socket.on('clear', (roomId) => {
    console.log(`🧹 Clear requested for room: ${roomId}`);
    socket.to(roomId).emit('clear');
  });

  // Disconnecting
  socket.on('disconnecting', () => {
    const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
    rooms.forEach(roomId => {
      if (roomUsers[roomId]) {
        roomUsers[roomId] = roomUsers[roomId].filter(u => u.socketId !== socket.id);
        io.to(roomId).emit('room-users', roomUsers[roomId]);
        socket.to(roomId).emit('user-left', { socketId: socket.id });
        console.log(`⚠️ User ${socket.id} left room ${roomId}`);
      }
    });
  });

  // Disconnected
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// SERVER START
server.listen(3001, () => {
  console.log('🚀 Server running on port 3001');
});
