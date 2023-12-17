const mongoose = require('mongoose');
const cron = require('node-cron');
const Topic = require('../models/topic.model');
const User = require('../models/user.model');
const Game = require('../models/game.model');
const HandleError = require('../utils/HandleError');

module.exports.newTopic = async (req, res, next) => {
    try {
        const io = req.app.get('socketio');
        const {gameID} = req.params
        // check if valid game
        if (!mongoose.Types.ObjectId.isValid(gameID)) throw new HandleError(`Game not found`, 404);
        const game = await Game.findById(gameID);
        if(!game) throw new HandleError(`Game not found`, 404);

        const {subject, topic_body} = req.body;
        const newTopic = new Topic({
            subject: subject.trim(),
            topic_body: topic_body.trim(),
            author: req.user.id,
            topic_for: game._id
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

module.exports.deleteTopic = async (req, res, next) => {
    try{
        const {topicID} = req.params;
        // check if valid Topic
        if (!mongoose.Types.ObjectId.isValid(topicID)) throw new HandleError(`Topic not found`, 404);
        const topic = await Topic.findByIdAndDelete(topicID);
        if(!topic) throw new HandleError(`Topic not found`, 404);
        // check if this topic is for current user
        if(!topic.author.equals(req.user.id)) throw new HandleError("This is not your topic, you can't do that", 403);
        // Remove the topic from the author and game 
        await User.findByIdAndUpdate(req.user.id, {$pull: { topics: topic._id }});
        await Game.findByIdAndUpdate(topic.topic_for, {$pull: { topics: topic._id }});
        res.status(200).json(topic);
    }catch(e) {
        next(e);
    }
}

module.exports.fetchTopic = async (req, res, next) => {
    try{
        const {id} = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) throw new HandleError(`Topic not found`, 404);
        const topic = await Topic.findById(id)
        .populate({path: 'author', select: ['first_name', 'last_name', 'email', 'avatar', 'isAdmin']})
        .populate({path: 'comments.author', select: ['first_name', 'last_name', 'email', 'avatar', 'isAdmin']})
        .populate('topic_for');
        
        // Sorting comments based on createdAt
        topic.comments.sort((a, b) => b.createdAt - a.createdAt);

        if(!topic) throw new HandleError(`Topic not found`, 404);
        res.status(200).json(topic);
    }catch(e) {
        console.log(e);
        next(e);
    }
}


module.exports.newComment = async (req, res, next) => {
    try{
        const io = req.app.get('socketio');
        const {topicID} = req.params;
        if (!mongoose.Types.ObjectId.isValid(topicID)) throw new HandleError(`Topic not found`, 404);
        const topic = await Topic.findById(topicID)
        
        if(!topic) throw new HandleError(`Topic not found`, 404);
        const newComment = {
            author: req.user.id,
            body: req.body.comment_body.trim(),
            createdAt: new Date()
        }
        topic.comments.push(newComment);
        // Sorting comments based on createdAt
        topic.comments.sort((a, b) => b.createdAt - a.createdAt);
        
        await topic.save()
        await topic.populate({path: 'comments.author', select: ['first_name', 'last_name', 'email', 'avatar', 'isAdmin']})

        io.emit('NewComment', {topicID:topic._id, comment: topic.comments});
        res.status(200).json(newComment);
    }catch(e) {
        next(e);
    }
}
