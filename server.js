const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store chat message history
let messageHistory = [];

// Serve static files from the 'public' directory
app.use(express.static(__dirname + '/public'));

// Listen for a new connection from clients
io.on('connection', (socket) => {
    console.log('A user connected');

    // Send chat message history to the new client
    socket.emit('history', messageHistory.slice(-100)); // Sending the last 100 messages

    // Listen for chat messages from clients
    socket.on('chat message', (data) => {
        // Add the message to the history
        const message = {
            sender: data.sender,
            message: data.message,
            timestamp: data.timestamp // Assuming the client sends the timestamp
        };
        messageHistory.push(message);
        // Limit the history to 100 messages
        if (messageHistory.length > 100) {
            messageHistory = messageHistory.slice(-100);
        }
        // Broadcast the message to all connected clients
        io.emit('chat message', message);
    });

    // Listen for disconnection events
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
