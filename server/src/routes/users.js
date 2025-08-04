const express = require('express');
const User = require('../models/User');
const { authenticateToken, requireAgentOrAdmin } = require('../utils/auth');
const { validatePreferences, sanitizeEmail, sanitizePhone } = require('../utils/validation');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('שגיאה בקבלת פרופיל:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בקבלת פרופיל'
      }
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    // Validate input
    if (name && name.length < 2) {
      return res.status(400).json({
        error: {
          message: 'שם חייב להכיל לפחות 2 תווים'
        }
      });
    }

    if (phone && !/^[0-9+\-\s()]+$/.test(phone)) {
      return res.status(400).json({
        error: {
          message: 'מספר טלפון לא תקין'
        }
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: {
          message: 'אימייל לא תקין'
        }
      });
    }

    // Check if email is already taken
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email: sanitizeEmail(email) });
      if (existingUser) {
        return res.status(400).json({
          error: {
            message: 'אימייל זה כבר קיים במערכת'
          }
        });
      }
    }

    // Update user
    const updates = {};
    if (name) updates.name = name.trim();
    if (phone) updates.phone = sanitizePhone(phone);
    if (email) updates.email = sanitizeEmail(email);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'פרופיל עודכן בהצלחה',
      user: updatedUser.toJSON()
    });

  } catch (error) {
    console.error('שגיאה בעדכון פרופיל:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בעדכון פרופיל'
      }
    });
  }
});

// Update user preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { error } = validatePreferences(req.body);
    if (error) {
      return res.status(400).json({
        error: {
          message: error.details[0].message
        }
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { preferences: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'העדפות עודכנו בהצלחה',
      preferences: updatedUser.preferences
    });

  } catch (error) {
    console.error('שגיאה בעדכון העדפות:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בעדכון העדפות'
      }
    });
  }
});

// Update notification settings
router.put('/notifications', authenticateToken, async (req, res) => {
  try {
    const { email, push, frequency } = req.body;

    const updates = {};
    if (typeof email === 'boolean') updates['notificationSettings.email'] = email;
    if (typeof push === 'boolean') updates['notificationSettings.push'] = push;
    if (frequency && ['immediate', 'hourly', 'daily'].includes(frequency)) {
      updates['notificationSettings.frequency'] = frequency;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    );

    res.json({
      message: 'הגדרות התראות עודכנו בהצלחה',
      notificationSettings: updatedUser.notificationSettings
    });

  } catch (error) {
    console.error('שגיאה בעדכון הגדרות התראות:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בעדכון הגדרות התראות'
      }
    });
  }
});

// Change password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: {
          message: 'סיסמה נוכחית וסיסמה חדשה נדרשות'
        }
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: {
          message: 'סיסמה חדשה חייבת להכיל לפחות 6 תווים'
        }
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: {
          message: 'סיסמה נוכחית שגויה'
        }
      });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({
      message: 'סיסמה שונתה בהצלחה'
    });

  } catch (error) {
    console.error('שגיאה בשינוי סיסמה:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בשינוי סיסמה'
      }
    });
  }
});

// Get all users (admin only)
router.get('/', authenticateToken, requireAgentOrAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        usersPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('שגיאה בקבלת משתמשים:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בקבלת משתמשים'
      }
    });
  }
});

// Get user by ID (admin only)
router.get('/:userId', authenticateToken, requireAgentOrAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        error: {
          message: 'משתמש לא נמצא'
        }
      });
    }

    res.json({ user });

  } catch (error) {
    console.error('שגיאה בקבלת משתמש:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בקבלת משתמש'
      }
    });
  }
});

// Update user (admin only)
router.put('/:userId', authenticateToken, requireAgentOrAdmin, async (req, res) => {
  try {
    const { name, phone, email, role, isActive, commissionPercentage } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (phone) updates.phone = sanitizePhone(phone);
    if (email) updates.email = sanitizeEmail(email);
    if (role && ['admin', 'agent'].includes(role)) updates.role = role;
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (commissionPercentage !== undefined) updates.commissionPercentage = commissionPercentage;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        error: {
          message: 'משתמש לא נמצא'
        }
      });
    }

    res.json({
      message: 'משתמש עודכן בהצלחה',
      user: updatedUser
    });

  } catch (error) {
    console.error('שגיאה בעדכון משתמש:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בעדכון משתמש'
      }
    });
  }
});

module.exports = router; 