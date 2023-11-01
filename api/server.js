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
app.use(cookieParser());
app.use(bodyParser.json());

// Routes
const AuthRoute = require('./routes/auth.route');
const ConversationRoute = require('./routes/conversation.route');
const UserRoute = require('./routes/user.route');
const GameRoute = require('./routes/game.route');

const { authMiddleware } = require('./middleware');

app.use('/api/auth/', AuthRoute)
app.use('/api/conversation/', authMiddleware, ConversationRoute) // protected route
app.use('/api/user/', UserRoute)
app.use('/api/game/', GameRoute)

// General search
const User = require('./models/user.model');
const Game = require('./models/game.model');
app.post('/api/search', async (req, res, next) => {
  try{
    let data = []
    // users
    const {q} = req.query
    if(q.length < 1) return 0;
    const users = await User.find({
      $or: [{
          $expr: {
            $regexMatch: {
              input: {
                $concat: ["$first_name", " ", "$last_name"] // Concatenate first_name and last_name
              },
              regex: new RegExp(q, "i") // Search for the full name
            }
          }
      }]
    }).select(['_id', 'avatar', 'first_name', 'last_name', 'isAdmin', 'email']);
    // games
    const games = await Game.find({title: { $regex: new RegExp(q, "i") }}).select(['title', 'main_photo'])
    // push all users and games to array and sort
    for(let i = 0; i < users.length; i++){
      data.push({
        title: users[i].first_name + " " + users[i].last_name,
        _id: users[i]._id,
        avatar: users[i].avatar,
        isAdmin: users[i].isAdmin,
        email: users[i].email,
        isUser: true,
      })
    }
    for(let i = 0; i < games.length; i++){
      data.push({
        title: games[i].title,
        _id: games[i]._id,
        main_photo: games[i].main_photo,
      })
    }
    // sort data (games and users) by title
    data.sort((a, b) => {
      const titleA = a.title.toUpperCase();
      const titleB = b.title.toUpperCase();
    
      if (titleA > titleB) {
        return 1; // Change the order here
      }
      if (titleA < titleB) {
        return -1; // Change the order here
      }
      return 0;
    });
    // send data to client
    res.status(200).json(data)
  }catch(e){
    next(e);
  }
})

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