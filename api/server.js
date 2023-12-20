if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const bodyParser = require('body-parser');

const app = express();
// craete io server
const server = http.createServer(app);
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

// conntect the database
const DB_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/Gaming_Hub'
mongoose.connect(DB_URL , {
    useNewUrlParser: true,  
    useUnifiedTopology: true,
    family:4
})
.then(()=> console.log("db connected"))
.catch((err)=> console.log(err))

// middlewares
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

// Routes
const AuthRoute = require('./routes/auth.route');
const ConversationRoute = require('./routes/conversation.route');
const UserRoute = require('./routes/user.route');
const GameRoute = require('./routes/game.route');
const GiveAwayRoute = require('./routes/giveaway.route');
const TopicRoute = require('./routes/topic.route');
const IndexRoute = require('./routes/index.route');

const { authMiddleware } = require('./middleware');

app.use('/api/', IndexRoute)
app.use('/api/auth/', AuthRoute)
app.use('/api/conversation/', authMiddleware, ConversationRoute) // protected route
app.use('/api/user/', UserRoute)
app.use('/api/game/', GameRoute)
app.use('/api/giveaway/', GiveAwayRoute)
app.use('/api/topic/', TopicRoute)

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