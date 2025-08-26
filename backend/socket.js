let onlineUsers = [];

const addNewUser = (userId, socketId) => {
    !onlineUsers.some(user => user.userId === userId) &&
        onlineUsers.push({ userId, socketId });
};

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter(user => user.socketId !== socketId);
};

const getUser = (userId) => {
    return onlineUsers.find(user => user.userId === userId);
};

module.exports = function (io) {
    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        socket.on("addUser", (userId) => {
            addNewUser(userId, socket.id);
            io.emit("getOnlineUsers", onlineUsers);
        });

        socket.on('join chat', (room) => {
            socket.join(room);
            console.log('User joined room: ' + room);
        });

        socket.on('typing', (room) => socket.in(room).emit('typing'));
        socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

        // --- CORRECTED MESSAGE HANDLER ---
        socket.on("new message", (newMessage) => {
            const chat = newMessage.chat;

            if (!chat.users) return console.log("chat.users not defined");

            // The room ID is the chat ID
            const room = chat._id;

            // Emit to all users in the chat room except the sender
            socket.to(room).emit("message received", newMessage);
        });
        // ---------------------------------

        // Message updated
        socket.on("message updated", (updatedMessage) => {
            const room = updatedMessage.chat._id;
            socket.to(room).emit("message updated", updatedMessage);
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected:", socket.id);
            removeUser(socket.id);
            io.emit("getOnlineUsers", onlineUsers);
        });
    });
};