const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('join', (room, username) => {
    socket.join(room, ()=>{
      io.to(room).emit('join', room, username);
    });
  });

  socket.on('leave', (room, username) => {
    socket.join(room, ()=>{
      io.to(room).emit('leave', room, username);
    });
  });

  socket.on('set_variable', (room, data) => {
    io.to(room).emit('set_variable', room, data);
  });

  socket.on('set_list', (room, data) => {
    io.to(room).emit('set_list', room, data);
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
  socket.on('disconnected', () => {
    console.log('user disconnected');
  });
});

http.listen(PORT, () => {
  console.log(`server is open at ${PORT}`);
});
