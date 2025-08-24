const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    
    // Ensure userId is set correctly from the token
    const userId = decoded.userId || decoded.id || decoded._id;
    
    if (!userId) {
      throw new Error('User ID not found in token');
    }

    // Set user info in request with consistent userId field
    req.user = {
      ...decoded,
      userId: userId,
      id: userId, 
      _id: userId 
    };

    console.log('Auth middleware - User info:', {
      userId: req.user.userId,
      role: req.user.role
    });

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

module.exports = auth; 