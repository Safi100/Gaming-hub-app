const jwt = require('jsonwebtoken');
const User = require('./models/user.model');
const HandleError = require('./utils/HandleError');

module.exports.authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization || req.cookies.access_token;
    if (!token) throw new HandleError('You must log in to access this', 401);
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) throw new HandleError('Invalid token', 401);
    req.user = decoded;
    next();
  });
  }catch(e) {
    next(e);
  }

};
module.exports.isAdmin = async (req, res, next) => {
  try{
    const user = await User.findById(req.user.id);
    if(!user.isAdmin) throw new HandleError('You are not allowed to access this', 403)
    next();
  }catch(e){
    next(e);
  }

}