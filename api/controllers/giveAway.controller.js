const GiveAway = require('../models/giveAway.model');
const User = require('../models/user.model');
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

        const newGiveAway = new GiveAway({
            heading: heading.trim(),
            body: body.trim(),
            game: game.trim(),
            max_participants: max_participants,
            winner_announcement_date: new Date(winner_announcement_date)
        })
        await newGiveAway.populate('game');
        console.log();
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
module.exports.fetchGivesAway = async (req, res, next) => {
    try{
        
    }catch(e){
        next(e);
    }
}