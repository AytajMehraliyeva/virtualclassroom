require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// ROUTES (müvafiq sən öz fayllarını əlavə etməlisən)
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require('./routes/userRoutes');

// EXPRESS APP
const app = express();
const server = http.createServer(app);

// CORS OPTIONS
const corsOptions = {
  origin: 'https://virtualclassroom-sb1c.onrender.com', // frontend ünvanını dəyişə bilərsən
  methods: ['GET', 'POST'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
  res.send('Virtual Classroom API is running');
});

// MONGOOSE CONNECT
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// SOCKET.IO SETUP
const io = new Server(server, {
  cors: corsOptions
});

// Otaq istifadəçilərinin saxlanması
const roomUsers = {};  // { roomId: [ { username, socketId } ] }

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-room', ({ roomId, username }) => {
    if (!username || username.trim() === '') {
      username = `Guest-${socket.id.slice(-4)}`;
    }

    console.log(`${username} joined room ${roomId}`);

    socket.join(roomId);

    if (!roomUsers[roomId]) roomUsers[roomId] = [];
    roomUsers[roomId].push({ username, socketId: socket.id });

    // Yeni qoşulana otaqdakı istifadəçilərin siyahısı
    io.to(socket.id).emit('room-users', roomUsers[roomId]);

    // Digərlərinə xəbər ver
    socket.to(roomId).emit('user-joined', { username, socketId: socket.id });

    // Bütün otağa yenilənmiş istifadəçi siyahısı
    io.to(roomId).emit('room-users', roomUsers[roomId]);
  });

  // WebRTC signaling
  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', data);
  });

  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', data);
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', data);
  });

  // Whiteboard events
  socket.on('draw', ({ roomId, ...coords }) => {
    socket.to(roomId).emit('draw', coords);
  });

  socket.on('clear', (roomId) => {
    console.log(`🧹 Clear requested for room: ${roomId}`);
    socket.to(roomId).emit('clear');
  });

  // İstifadəçi ayrılır
  socket.on('disconnecting', () => {
    const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
    rooms.forEach(roomId => {
      if (roomUsers[roomId]) {
        roomUsers[roomId] = roomUsers[roomId].filter(u => u.socketId !== socket.id);
        io.to(roomId).emit('room-users', roomUsers[roomId]);
        socket.to(roomId).emit('user-left', { socketId: socket.id });
        console.log(`User ${socket.id} left room ${roomId}`);
      }
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// SERVERİ START ET
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
