const HandleError = require('../utils/HandleError');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const {cloudinary} = require('../utils/cloudinary');

module.exports.fetchCurrentUser = async (req, res, next) => {
  try{
    const currentUser = await User.findById(req.user.id).select(['-isVerified', '-password', '-updatedAt'])
    res.status(200).json(currentUser)
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
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new HandleError(`User not found`, 404);
    const user = await User.findById(id)
    // Hamdling error
    if(!user) throw new HandleError(`User not found`, 404)
    if(req.user.id == user._id) throw new HandleError(`You can't follow/unfollow your self -_-`, 400)
    if(!user.followers.includes(req.user.id)) {
      // add user to followers
      user.followers.push(req.user.id);
      // push notification for followed user
      const notification = {from: req.user.id, body: "Started following you"}
      user.notifications.push(notification);
    }else{
      // remove user from followers
      user.followers = user.followers.filter(followerId => followerId != req.user.id);
    }
    await user.populate({path: 'followers', select: ['first_name', 'last_name', 'avatar', 'email', 'isAdmin']})
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
      const user = await User.findById(id).select(['-isVerified', '-password', '-updatedAt'])
      .populate({path: 'followers', select: ['first_name', 'last_name', 'avatar', 'email', 'isAdmin']})
      if(!user) throw new HandleError(`User not found`, 404)
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
    
  }catch(e){
    next(e)
  }
}