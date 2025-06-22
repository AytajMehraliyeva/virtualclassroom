const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const Message = require('./models/Message'); 

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://tu7lzxxdc:aytac123@cluster0.fvv4h2i.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});


app.get('/messages/:roomId', async (req, res) => {
  const messages = await Message.find({ room: req.params.roomId });
  res.json(messages);
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on('send_message', async (data) => {
    const newMsg = new Message({
      room: data.room,
      username: data.username,
      message: data.message
    });

    await newMsg.save();
    io.to(data.room).emit('receive_message', newMsg);
  });

  socket.on('disconnect', () => {
    console.log(` User disconnected: ${socket.id}`);
  });
});

server.listen(3001, () => {
  console.log(' Server started on port 3001');
}); 
 