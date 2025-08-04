const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateRegistration, validateLogin } = require('../utils/validation');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    // Validate input
    const { error } = validateRegistration(req.body);
    if (error) {
      return res.status(400).json({
        error: {
          message: error.details[0].message
        }
      });
    }

    const { email, password, name, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: {
          message: 'משתמש עם אימייל זה כבר קיים במערכת'
        }
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      phone,
      role: 'agent' // Default role
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "real-estate-jwt-secret-key-2024",
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'משתמש נוצר בהצלחה',
      user: user.toJSON(),
      token
    });

  } catch (error) {
    console.error('שגיאה ביצירת משתמש:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה ביצירת משתמש'
      }
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    // Validate input
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({
        error: {
          message: error.details[0].message
        }
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: {
          message: 'אימייל או סיסמה שגויים'
        }
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: {
          message: 'החשבון לא פעיל'
        }
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: {
          message: 'אימייל או סיסמה שגויים'
        }
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "real-estate-jwt-secret-key-2024",
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'התחברות הצליחה',
      user: user.toJSON(),
      token
    });

  } catch (error) {
    console.error('שגיאה בהתחברות:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בהתחברות'
      }
    });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: {
          message: 'לא סופק טוקן'
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "real-estate-jwt-secret-key-2024");
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

    res.json({
      user: user.toJSON()
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: {
          message: 'טוקן לא תקין'
        }
      });
    }
    
    console.error('שגיאה בקבלת פרופיל:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בקבלת פרופיל'
      }
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: {
          message: 'לא סופק טוקן'
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "real-estate-jwt-secret-key-2024");
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: {
          message: 'משתמש לא תקין'
        }
      });
    }

    // Generate new token
    const newToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "real-estate-jwt-secret-key-2024",
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'טוקן חודש בהצלחה',
      token: newToken
    });

  } catch (error) {
    console.error('שגיאה בחידוש טוקן:', error);
    res.status(401).json({
      error: {
        message: 'טוקן לא תקין'
      }
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    message: 'התנתקות הצליחה'
  });
});

module.exports = router; 