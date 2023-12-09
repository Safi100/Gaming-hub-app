const mongoose = require('mongoose');
const Giveaway = require('../models/giveAway.model');
const User = require('../models/user.model');
const Games = require('../models/game.model');
const HandleError = require('../utils/HandleError');

module.exports.NewGiveAway = async (req, res, next) => {
    try{
        const {heading, body, game, max_participants, winner_announcement_date} = req.body
        const choosenDate = new Date(winner_announcement_date);
        // Get the current date and set time to midnight for date-only comparison
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        // Create a date object for tomorrow
        const tomorrow = new Date(currentDate);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Check if choosenDate is less than tomorrow
        if (choosenDate < tomorrow) throw new HandleError("Winner announcement date must be at least tomorrow's date.", 400);

        const newGiveAway = new Giveaway({
            heading: heading.trim(),
            body: body.trim(),
            game: game.trim(),
            max_participants: max_participants,
            winner_announcement_date: new Date(winner_announcement_date)
        })
        await newGiveAway.populate('game');
        // send notification for users that have this game in favorites games
        const users = await User.find({"favorite_games": { $in: [game] }});
        const saveUserPromises = users.map(user => {
            user.notifications.push({
                content_id: newGiveAway._id.toString(),
                body: `New Giveaway for ${newGiveAway.game.title}`,
                about: 'giveaway',
            });
            return user.save(); // Save each user individually
        });
        await Promise.all(saveUserPromises); // Wait for all user saves to complete
        await newGiveAway.save()
        res.status(200).json(users);
    }catch(e){
        console.log(e);
        next(e)
    }
}
module.exports.editGiveaway = async (req, res, next) => {
    try{
        const {id} = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) throw new HandleError(`Giveaway not found`, 404);
        const giveaway = await Giveaway.findByIdAndUpdate(id);
        if(!giveaway) throw new HandleError(`Giveaway not found`, 404);

        const {heading, body, game, max_participants, winner_announcement_date} = req.body
        const choosenDate = new Date(winner_announcement_date);
        // Get the current date and set time to midnight for date-only comparison
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        // Create a date object for tomorrow
        const tomorrow = new Date(currentDate);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if(max_participants < giveaway.participants.length) throw new Error(`Can't set max participants lower than current participants\nParticipants count: ${giveaway.participants.length}`, 400);
        // Check if choosenDate is less than tomorrow
        if (choosenDate < tomorrow) throw new HandleError("Winner announcement date must be at least tomorrow's date.", 400);

        giveaway.heading = heading;
        giveaway.body = body;
        giveaway.game = game;
        giveaway.max_participants = max_participants;
        giveaway.winner_announcement_date = new Date(winner_announcement_date);
        await giveaway.save();
        res.status(200).send({message: "Giveaway updated successfully!"});

    }catch(e){
        next(e);
    }
}
module.exports.fetchGiveAways = async (req, res, next) => {
    try{
        const giveaway_per_page = 10 // 10 per page
        const page = req.query.page || 1; // number of page, initial is 1
        const skip = (page - 1) * giveaway_per_page // skip of giveaways when fetch
        let query = {};
        const today = new Date();
        query.winner_announcement_date = { $gte: today }
        const {gameCategory} = req.query || '';
        console.log(gameCategory);
        if (gameCategory) query.game = gameCategory; // filter giveaways using game category
        query.winner = null // fetch giveaways that don't have a winner yet.
        const GiveawaysCount = await Giveaway.countDocuments(query) // number of all giveaway that fetched
        const giveaways = await Giveaway.find(query).limit(giveaway_per_page).skip(skip).populate('game')
        .populate({path: 'participants', select:['first_name', 'last_name', 'email', 'avatar']});
        const Counts_of_Pages = Math.ceil(GiveawaysCount / giveaway_per_page) // Round up to nearest integer
        res.status(200).json({giveaways, Counts_of_Pages});
    }catch(e){
        next(e);
    }
}

module.exports.giveawayProfile = async (req, res, next) => {
    try{
        const {id} = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) throw new HandleError(`Giveaway not found`, 404);
        const giveaway = await Giveaway.findById(id).populate('game')
        .populate('participants', 'first_name last_name email avatar')
        .populate('winner', 'first_name last_name email avatar');

        if(!giveaway) throw new HandleError(`Giveaway not found`, 404);
        res.status(200).json(giveaway);
    }catch(e){
        next(e);
    }
}

module.exports.gamesHaveAvailabeGiveaway = async (req, res, next) => {
    try{
        const today = new Date();
        const giveaways = await Giveaway.find({ winner_announcement_date: { $gte: today } })
        .populate({ path: 'game', select: ['title'] });
        
        const currentDate = new Date();

        const games = [];
        // Filter giveaways where the winner_announcement_date has not passed
        giveaways.map(giveaway => {
            const winnerAnnouncementDate = new Date(giveaway.winner_announcement_date);
            if(winnerAnnouncementDate > currentDate) games.push(giveaway.game);
        });
        const available_giveaways_games = await Games.find({_id: games}).select(['title'])
        // get games that have availabe giveaway
        res.status(200).send(available_giveaways_games)
    }catch(e){
        next(e);
    }
}
module.exports.joinGiveaway = async (req, res, next) => {
    try {
        const io = req.app.get('socketio');
        const {id} = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) throw new HandleError(`Giveaway not found`, 404);
        const giveaway = await Giveaway.findById(id);
        if(!giveaway) throw new HandleError(`Giveaway not found`, 404);

        // Check if current user has already joined the giveaway
        if (giveaway.participants.includes(req.user.id)) throw new HandleError(`You are already joined this giveaway`, 400);
        giveaway.participants.push(req.user.id);
        await giveaway.save();
        await giveaway.populate({path: 'participants', select:['first_name', 'last_name', 'email', 'avatar']});
        // Emit an event to notify connected clients about the updated giveaway data
        io.emit('joinGiveaway', { giveawayID: giveaway._id, Participants: giveaway.participants });
        res.status(200).send(giveaway.participants);
    }catch(e){
        next(e);
    }
}

module.exports.deleteGiveaway = async (req, res, next) => {
    try{
        const io = req.app.get('socketio');
        const {id} = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) throw new HandleError(`Giveaway not found`, 404);
        const giveaway = await Giveaway.findByIdAndDelete(id);
        if(!giveaway) throw new HandleError(`Giveaway not found`, 404);
        io.emit('deleteGiveaway', {giveawayID:giveaway._id});
        res.status(200).send({message: "Giveaway deleted successfully!"});
    }catch(e){
        next(e);
    }
}