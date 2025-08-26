// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL // Your frontend URL from .env
}));
app.use(helmet());
app.use(morgan('dev')); // Logger for development
app.use(express.json()); // To accept JSON data in the body

// Simple Route for testing
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Mount Routers (we will create these later)
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/chat', require('./routes/chatRoutes')); // Add this line
app.use('/api/message', require('./routes/messageRoutes')); // Add this line


const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


// Socket.IO setup (we will configure this in socket.js later)
const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.CLIENT_URL,
    },
});

require('./socket')(io); // Pass io instance to socket handler
module.exports.io = io; 