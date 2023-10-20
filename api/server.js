if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
// const socket = require('./utils/socket');
const app = express();

const server = http.createServer(app);
// const io = socket(server);
const io = require('socket.io')(server, {
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

  });
app.set('socketio', io);

mongoose.connect( 'mongodb://localhost:27017/Gaming_Hub' , {
    useNewUrlParser: true,  
    useUnifiedTopology: true,
    family:4
})
.then(()=> console.log("db connected"))
.catch((err)=> console.log(err))

app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

const Messages = require('./models/message.model');
const { authMiddleware } = require('./middleware')

app.get('/test', authMiddleware, async (req, res) => {
  await Messages.deleteMany()
})

const AuthRoute = require('./routes/auth.route');
const ConversationRoute = require('./routes/conversation.route');
const UserRoute = require('./routes/user.route');

app.use('/api/auth/', AuthRoute)
app.use('/api/conversation/', authMiddleware, ConversationRoute) // protected route
app.use('/api/user/', UserRoute)


app.use((err, req, res, next) => {
    if(!err.message) err.message = 'Internal Server Error'
    const {statusCode = 500 } = err
    console.log(err.message);
    res.status(statusCode).json(err.message)
})

// start the server
server.listen(8000, () => {
    console.log('Server is running on port 8000');
});