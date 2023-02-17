const express = require('express');
const route = require('./route');
const socket = require('./socket');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const port = 3000;

app.set('view engine', 'ejs');

app.use(express.static('public'));

route(app);

socket(io);

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
