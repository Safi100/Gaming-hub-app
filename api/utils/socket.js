const socketIO = require('socket.io');

// Create a function that takes an HTTP server instance as an argument
module.exports = function (server) {
  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:3000", // Allow connections from this origin
      methods: "*", // Allow all HTTP methods
      credentials: true, // Allow passing cookies, authorization headers, etc.
    },
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    // Other socket.io event handlers...

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
    
    // Return the updated 'io' instance
    return io;
  });
};