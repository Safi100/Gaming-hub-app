const Game = require('../models/game.model');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

module.exports.generalSearch = async (req, res, next) => {
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
                regex: new RegExp(q.trim(), "i") // Search for the full name
              }
            }
        }]
      }).select(['_id', 'avatar', 'first_name', 'last_name', 'isAdmin', 'email']);
      // games
      const games = await Game.find({title: { $regex: new RegExp(q.trim(), "i") }}).select(['title', 'main_photo', 'genres'])
      // push all users and games to array and sort
      for(let i = 0; i < users.length; i++){
        data.push({
          title: users[i].first_name + " " + users[i].last_name,
          _id: users[i]._id,
          avatar: users[i].avatar || null,
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
          genres: games[i].genres
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
}

module.exports.homePageData = async (req, res, next) => {
    try {
        let favorite_games
        // Fetch admins
        const admins = await User.find({ isAdmin: true }).select(['first_name', 'last_name', 'email', 'avatar']);    
        // Fetch games
        let games = await Game.find().select(['main_photo', 'title']);
        // Check for JWT token to determine if the user is logged in
        const token = req.headers.authorization || req.cookies.access_token;
        // If user is logged in, fetch favorite games
        if(token){
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            if(req.user?.id){
                // get current user favorite games
                const currentUser = await User.findById(req.user.id).select(['favorite_games'])
                .populate({path: 'favorite_games', select: ['main_photo', 'title']});
                favorite_games = currentUser.favorite_games;
                // remove games that's already in favorite games
                favorite_games.forEach(favGame => {
                    games = games.filter(games => games._id.toString() !== favGame._id.toString())
                })
            }
        }
        res.status(200).send({games, admins, favorite_games});
    }catch(e) {
        next(e);
    }
}