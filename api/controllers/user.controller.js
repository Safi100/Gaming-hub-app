const HandleError = require('../utils/HandleError');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const BannedUsers = require('../models/bannedUsers.model');
const bcrypt = require('bcrypt');
const {cloudinary} = require('../utils/cloudinary');
const cron = require('node-cron');

module.exports.fetchCurrentUser = async (req, res, next) => {
  try{
    let isBanned = false;
    let banDetails;
    const currentUser = await User.findById(req.user.id)
    .select(['-isVerified', '-password', '-updatedAt', '-createdAt', '-followers', '-topics'])
    const bannedUsers = await BannedUsers.find()
    bannedUsers.forEach(bannedUser => {
      if(currentUser._id == bannedUser.user.toString()) {
        isBanned = true;
        banDetails = {
          bannedUntil: bannedUser.bannedUntil,
          reason: bannedUser.reason,
          bannedFrom: bannedUser.createdAt
        }
      }
    })
    res.status(200).json({currentUser, isBanned, banDetails})
  }catch(e){
    next(e);
  }
}
module.exports.searchForUsers = async (req, res, next) => {
  try{
      const {q} = req.query
      if(q.length < 1) return 0;
      const users = await User.find({
        _id: { $ne: req.user.id }, // search doesn't include current user
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
      res.status(200).json(users)
  }catch(e){
      console.log(e);
      next(e)
  }
}
module.exports.follow_unfollow_user = async (req, res, next) => {
  try{
    const io = req.app.get('socketio');
    const {id} = req.params;
    // Handling error
    if (!mongoose.Types.ObjectId.isValid(id)) throw new HandleError(`User not found`, 404);
    const user = await User.findById(id)
    if(!user) throw new HandleError(`User not found`, 404)
    if(req.user.id == user._id) throw new HandleError(`You can't follow/unfollow your self -_-`, 400)
    const currentUser = await User.findById(req.user.id);
    if(!user.followers.includes(req.user.id)) {
      // add user to followers
      user.followers.push(req.user.id);
      // push notification for followed user
      const notification = {
        body:`${currentUser.first_name} ${currentUser.last_name} Started following you`,
        content_id: currentUser._id,
        about: "follow"
      }
      user.notifications.push(notification);
      io.emit('sendNotification', { userID: user._id, notification: notification });
    }else{
      // remove user from followers
      user.followers = user.followers.filter(followerId => followerId != req.user.id);
    }
    await user.save();
    res.status(200).json(user.followers);
  }catch(e){
    console.log(e);
    next(e);
  }
}
module.exports.fetchUserDataProfile = async (req, res, next) => {
  try{
      const {id} = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) throw new HandleError(`User not found`, 404);
      let user = await User.findById(id).select(['-isVerified', '-password', '-updatedAt', '-notifications'])
      .populate({path: 'favorite_games', select: ['title']})
      .populate({path: 'topics', populate: {path: 'author', select: ["_id"]}});
      if(!user) throw new HandleError(`User not found`, 404)
      // check if user account is banned
      let isBanned = false;
      const bannedUsers = await BannedUsers.find()
      bannedUsers.forEach(bannedUser => {
        if(user._id == bannedUser.user.toString()) {
          isBanned = true;
        }
      })
      user = {...user._doc, isBanned: isBanned}
      res.status(200).json(user);
  }catch(e){
      next(e);
  }
}
module.exports.editUserDataProfile = async (req, res, next) => {
  try{
    // Helper function to capitalize a string
    const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)
    let user = await User.findById(req.user.id).select(['-isVerified', '-password', '-updatedAt'])
    .populate({path: 'followers', select: ['first_name', 'last_name', 'avatar', 'email', 'isAdmin']})
    .populate({path: 'favorite_games', select: ['title', 'main_photo']})
    .populate({path: 'topics', populate: {path: 'author', select: ['first_name', 'last_name', 'avatar', 'isAdmin', 'email']}});
    
    const {first_name, last_name, gender, bio} = req.body

    // Update the user document
    user.first_name = capitalize(first_name.trim());
    user.last_name = capitalize(last_name.trim());
    user.gender = gender === null ? "" : capitalize(gender.trim());
    user.bio = bio;
    if(req.file){
      // delete prev avatar and set the new avatar
      if (user.avatar && user.avatar.filename) await cloudinary.uploader.destroy(user.avatar.filename);
      // Set the new avatar details
      user.avatar = { url: req.file.path, filename: req.file.filename };
    }
    await user.save()
    res.status(200).json(user);
  }catch(e){
    if (req.file) {
      // Delete image from Cloudinary
      await cloudinary.uploader.destroy(req.file.filename);
    }
    console.log(e);
    next(e)
  }
}
module.exports.removeProfilePicture = async (req, res, next) => {
  try{
    const user = await User.findById(req.user.id)
    if (!user.avatar || !user.avatar.url || !user.avatar.filename) {
      throw new HandleError(`You already do not have a profile picture`, 404);
    }
    await cloudinary.uploader.destroy(user.avatar.filename);
    user.avatar = null
    await user.save()
    res.status(200).json(user.avatar);
  }catch(e){
    next(e)
  }
}
module.exports.changePassword = async (req, res, next) => {
  try{
    let {current_password, new_password, confirm_password} = req.body;
    current_password = current_password.trim();
    new_password = new_password.trim();
    confirm_password = confirm_password.trim();
    if(current_password.length < 6) throw new HandleError('Password must be at least 6 characters', 400);
    if(new_password.length < 6) throw new HandleError('New password must be at least 6 characters', 400);
    if(confirm_password !== new_password) throw new HandleError("Passwords don't match", 400);
    const user = await User.findById(req.user.id);
    const match = await bcrypt.compare(current_password, user.password);
    if(!match) throw new HandleError('Password you provided is wrong.', 403)
    // if correct
    const hashedPassword = await bcrypt.hash(new_password, 10);
    user.password = hashedPassword
    await user.save();
    res.status(200).send('Password changed successfully.');
  }catch(e){
    next(e)
  }
}
module.exports.clearNotifications = async (req, res, next) => {
  try{
    const user = await User.findById(req.user.id);
    user.notifications = [];
    await user.save();
    res.status(200).send(user.notifications)
  }catch(e){
    next(e);
  }
}
module.exports.banUser = async (req, res, next) => {
  try{
    const {id} = req.params; 
    const {reason} = req.body;
    const days = req.body.days || undefined;
    // Handling error
    if(days < 1 && days != undefined) throw new HandleError(`Choose a valid day, greater or than 1 day or for permanent leave it empty`);
    if (!mongoose.Types.ObjectId.isValid(id)) throw new HandleError(`User not found`, 404);
    const user = await User.findById(id)
    if(!user) throw new HandleError(`User not found`, 404)
    if(user.isAdmin) throw new HandleError(`You can't ban an administrator`, 401)
    // new document
    const NewBannedUser = new BannedUsers({
      user: id,
      reason: reason.trim(),
      bannedUntil: days ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : null,
    })
    // save document and send it in response
    await NewBannedUser.populate({path: 'user', select:['first_name', 'last_name', 'email', 'avatar'] })
    await NewBannedUser.save();
    res.status(200).json(NewBannedUser);
  } catch (error) {
    if (error.code === 11000) {
      next(new HandleError('User already banned', 401));
    } else {
      next(error);
    }
  }
}
module.exports.bannedUsers = async (req, res, next) => {
  try {
    const bannedUsers = await BannedUsers.find().populate({path: 'user', select:['first_name', 'last_name', 'email', 'avatar'] })
    res.status(200).json(bannedUsers);
  }catch(e){
    next(e);
  }
}
module.exports.removeBan = async (req, res, next) => {
  try {
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new HandleError(`User not found`, 404);
    const user = await User.findById(id)
    if(!user) throw new HandleError(`User not found`, 404)

    const bannedUser = await BannedUsers.findOneAndDelete({user: id});
    if(!bannedUser) throw new HandleError(`User is not banned`, 404)
    
    res.status(200).json(bannedUser);
  }catch(e){
    next(e);
  }
}

// Schedule a job to run every hour (at the beginning of each hour)
cron.schedule('0 * * * *', async () => {
  try {
    const bannedUsers = await BannedUsers.find();
    bannedUsers.forEach(async (user) => {
      // null ban date mean it's ban forever
      if (user.bannedUntil && new Date(user.bannedUntil) < new Date()) {
        // If bannedUntil is not null and the date has passed
        await BannedUsers.deleteOne({ _id: user._id });
        console.log(`Remove ban on user with ID: ${user._id}`);
      }
    });
  } catch (e) {
    console.error(e);
  }
});