const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate user
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: {
          message: 'לא סופק טוקן אימות'
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: {
          message: 'משתמש לא נמצא'
        }
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: {
          message: 'החשבון לא פעיל'
        }
      });
    }

    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: {
          message: 'טוקן לא תקין'
        }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          message: 'טוקן פג תוקף'
        }
      });
    }

    console.error('שגיאה באימות:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה באימות'
      }
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        message: 'אימות נדרש'
      }
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: {
        message: 'גישה נדרשת למנהל'
      }
    });
  }

  next();
};

// Middleware to check if user is agent or admin
const requireAgentOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        message: 'אימות נדרש'
      }
    });
  }

  if (!['admin', 'agent'].includes(req.user.role)) {
    return res.status(403).json({
      error: {
        message: 'גישה נדרשת לסוכן או מנהל'
      }
    });
  }

  next();
};

// Middleware to check if user owns the resource or is admin
const requireOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'אימות נדרש'
        }
      });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (!resourceUserId) {
      return res.status(400).json({
        error: {
          message: 'מזהה משתמש לא סופק'
        }
      });
    }

    if (resourceUserId !== req.user._id.toString()) {
      return res.status(403).json({
        error: {
          message: 'אין לך הרשאה לגשת למשאב זה'
        }
      });
    }

    next();
  };
};

// Optional authentication middleware
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (user && user.isActive) {
      req.user = user;
    }

    next();

  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAgentOrAdmin,
  requireOwnershipOrAdmin,
  optionalAuth
}; 