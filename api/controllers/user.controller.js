const HandleError = require('../utils/HandleError');
const mongoose = require('mongoose');
const User = require('../models/user.model');

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
module.exports.fetchUserDataProfile = async (req, res, next) => {
  try {
      const {id} = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) throw new HandleError(`User not found`, 404);
      const user = await User.findById(id).select(['-isVerified', '-password', '-updatedAt']);
      if(!user) throw new HandleError(`User not found`, 404)
      res.status(200).json(user);
  }catch(e){
      next(e);
  }
}
// todo
module.exports.editUserDataProfile = async (req, res, next) => {}
// module.exports. = async (req,