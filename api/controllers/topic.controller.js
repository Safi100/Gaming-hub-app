const mongoose = require('mongoose');
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
        const topic = await Topic.findById(topicID);
        if(!topic) throw new HandleError(`Topic not found`, 404);
        // check if this topic is for current user or this user is an admin
        const currentUser = await User.findById(req.user.id);
        if (!(topic.author.equals(currentUser._id) || currentUser.isAdmin)) throw new HandleError("You don't have permission to delete it", 403);
        // Remove the topic from the author and game 
        await User.findByIdAndUpdate(req.user.id, {$pull: { topics: topic._id }});
        await Game.findByIdAndUpdate(topic.topic_for, {$pull: { topics: topic._id }});
        await Topic.deleteOne({_id: topic._id})
        res.status(200).json(topic);
    }catch(e) {
        next(e);
        console.log(e);
    }
}

module.exports.updateTopic = async (req, res, next) => {
    try {
        const {id} = req.params;
        const {subject, topic_body} = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) throw new HandleError(`Topic not found`, 404);
        const topic = await Topic.findById(id)
        if(!topic) throw new HandleError(`Topic not found`, 404);
        // check if the topic for this current user
        if(!topic.author.equals(req.user.id)) throw new HandleError(`You don't have permission to update this topic`, 403);
        
        topic.subject = subject.trim();
        topic.topic_body = topic_body.trim();
        await topic.save();
        res.status(200).send({ message: 'topic updated successfully!'})
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
        if(!topic) throw new HandleError(`Topic not found`, 404);
        
        // Sorting comments based on createdAt
        topic.comments.sort((a, b) => b.createdAt - a.createdAt);

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

        // send notification to author of topic about new comment if comment author not topic author
        const comment_author = await User.findById(req.user.id); // commenter user
        const user = await User.findById(topic.author._id) // topic author user
        if(comment_author._id.toString() !== user._id.toString()) {
            const notification = {
                about: "topic",
                content_id: topic._id,
                body: `${comment_author.first_name} ${comment_author.last_name} Comment on your topic`,
                date: new Date()
            }
            user.notifications.push(notification)
            io.emit('sendNotification', {userID: user._id, notification: notification});
            await user.save()
        }
        res.status(200).json(newComment);
        }catch(e) {
        next(e);
    }
}

module.exports.deleteComment = async (req, res, next) => {
    try{
        const currentUser = await User.findById(req.user.id);

        const io = req.app.get('socketio');
        const {topicID, commentID} = req.params;
        // validate topic
        if (!mongoose.Types.ObjectId.isValid(topicID)) throw new HandleError(`Topic not found`, 404);
        const topic = await Topic.findById(topicID)
        if(!topic) throw new HandleError(`Topic not found`, 404);
        // validate comment
        const isExist = topic.comments.some((comment) => comment._id == commentID)
        if(!isExist) {
            throw new HandleError(`Comment not found`, 404);
        }else{
            const comment = topic.comments.find((comment) => comment._id == commentID);
            if(!comment) throw new HandleError(`Comment not found`, 404);
            if (!(comment.author.equals(currentUser._id) || currentUser.isAdmin)) throw new HandleError("You don't have permission to delete it", 403);
            // Delete comment from topic comments
            topic.comments = topic.comments.filter((comment) => comment._id != commentID);
            // Sorting comments based on createdAt
            topic.comments.sort((a, b) => b.createdAt - a.createdAt);
            // Save the updated topic
            await topic.save()
            await topic.populate({path: 'comments.author', select: ['first_name', 'last_name', 'email', 'avatar', 'isAdmin']})
            io.emit('DeleteComment', {topicID:topic._id, comment: topic.comments});
            res.status(200).json({message: "Topic deleted successfully!", data: comment});
        }
    }catch(e) {
        next(e);
    }
}
