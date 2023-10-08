const jwt = require('jsonwebtoken');

module.exports.authMiddleware = (req, res, next) => {
    const token = req.headers.authorization || req.cookies.access_token;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};
