const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const cors = require('cors');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set('views', './views');
//app.use('/', express.static(path.join(__dirname + "static")));
//const index = require('index.js');

let rooms = {};
app.use(cors());

//app.use('/', index);
app.get('/', (req, res) => {
  console.log(req.protocol + req.hostname);
  res.render("index", {protocol: "http", data: "localhost:8000"});
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
    console.log(data);
    io.to(room).emit('set_variable', room, data);
  });

  socket.on('set_list', (room, data) => {
    console.log(data);
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
  console.log(`server5 ewfeis open at ${PORT}`);
});
