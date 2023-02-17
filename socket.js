const socket = (io) => {
    let users = {};
    io.on("connection", (socket) => {
    let typing = false;
    let typingTimeout;

    socket.on('typing', (name) => {
        if(!typing) {
        typing = true;
        socket.broadcast.emit('typing', `${name} sedang mengetik...`);
        }
        clearTimeout(typingTimeout);
        typingTimeout= setTimeout(() => {
        typing = false;
        socket.broadcast.emit('stop typing');
        }, 2000);
    });

    socket.on('stop typing', () => {
        clearTimeout(typingTimeout);
        typing = false;
        socket.broadcast.emit('stop typing', '');
    });

    socket.on("join", (names) => {
        users[socket.id] = names;
        socket.broadcast.emit("join", names);
    });

    socket.on("message", (data) => {
        const { name, message } = data;
        socket.broadcast.emit("message", name, message);
    });

    socket.on('play', () => {
        socket.broadcast.emit('play');
    });
    
    socket.on('pause', () => {
        socket.broadcast.emit('pause');
    });

    socket.on('timeupdate', (time) => {
        socket.broadcast.emit('timeupdate', time);
    });

    socket.on('disconnect', () => {
        const disconnected = users[socket.id];
        socket.broadcast.emit('user-disconnect', disconnected, socket.id);
        delete users[socket.id];
    });

    socket.on('join', () => {
        const userArr = users;
        io.emit('userList', userArr);
    });
    

    });
}

module.exports = socket;