const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId, isActive: true });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

// Role-based access control middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'You do not have permission to perform this action.' 
      });
    }
    next();
  };
};

// Resource ownership middleware
const checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params.id);
      
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found.' });
      }

      // Allow admins to access any resource
      if (req.user.role === 'admin') {
        req.resource = resource;
        return next();
      }

      // Check if user is the creator or a collaborator
      if (resource.creator.toString() === req.user._id.toString() || 
          (resource.collaborators && resource.collaborators.includes(req.user._id))) {
        req.resource = resource;
        return next();
      }

      res.status(403).json({ error: 'You do not have permission to access this resource.' });
    } catch (error) {
      res.status(500).json({ error: 'Server error.' });
    }
  };
};

module.exports = {
  auth,
  authorize,
  checkOwnership
}; 