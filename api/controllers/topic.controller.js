const mongoose = require('mongoose');
const cron = require('node-cron');
const Topic = require('../models/topic.model');
const User = require('../models/user.model');
const Game = require('../models/game.model');

module.exports.newTopic = async (req, res, next) => {
    try {
        const io = req.app.get('socketio');
        const {gameID} = req.params
        // check if valid game
        if (!mongoose.Types.ObjectId.isValid(gameID)) throw new HandleError(`Giveaway not found`, 404);
        const game = await Game.findById(gameID);
        if(!game) throw new HandleError(`Game not found`, 404);

        const {subject, topic_body} = req.body;
        const newTopic = new Topic({
            subject: subject.trim(),
            topic_body: topic_body.trim(),
            author: req.user.id
        })
        // push topic to current user
        const author = await User.findById(req.user.id)
        author.topics.push(newTopic)
        // Loop through followers of the author and send notifications to each follower
        for (const followerId of author.followers) {
            // Create a notification for each follower
            const follower = await User.findById(followerId);
            const followerNotification = {
            about: "topic",
            content_id: newTopic._id,
            body: `${author.first_name} ${author.last_name} Added a new topic`,
            date: new Date()
            };
            // Add the notification to the follower's notifications array
            follower.notifications.push(followerNotification);
            // Save the follower's updated profile with the new notification
            await follower.save();
            // Emit a notification event to the follower using socket.io
            io.emit('sendNotification', { userID: followerId, notification: followerNotification });
        }
        // push topic to game group
        game.topics.push(newTopic);

        // save all to database
        await game.save();
        await author.save();
        await newTopic.save();
        // response
        res.status(200).json({topicID: newTopic._id})
    }catch(e) {
        next(e);
    }
}

module.exports.newComment = (req, res, next) => {
    try{

    }catch(e) {
        next(e);
    }
}
