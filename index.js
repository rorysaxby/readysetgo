const express = require('express');
const http = require('http').createServer(express);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
    });
});

// Specify port
const port = process.env.PORT || 5000;

http.listen(port, () => {
  console.log('listening on *: ' + port);
});