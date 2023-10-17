const HandleError = require('../utils/HandleError');
const User = require('../models/user.model');

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