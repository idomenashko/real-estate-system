const express = require('express');
const { authenticateToken } = require('../utils/auth');

const router = express.Router();

// Get user's notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    // This will be implemented when we add a Notification model
    // For now, return empty array
    res.json({
      notifications: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalNotifications: 0,
        notificationsPerPage: 10
      }
    });

  } catch (error) {
    console.error('שגיאה בקבלת התראות:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בקבלת התראות'
      }
    });
  }
});

// Mark notification as read
router.put('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    // This will be implemented when we add a Notification model
    res.json({
      message: 'התראה סומנה כנקראה'
    });

  } catch (error) {
    console.error('שגיאה בסימון התראה:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בסימון התראה'
      }
    });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    // This will be implemented when we add a Notification model
    res.json({
      message: 'כל ההתראות סומנו כנקראו'
    });

  } catch (error) {
    console.error('שגיאה בסימון כל ההתראות:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בסימון כל ההתראות'
      }
    });
  }
});

module.exports = router; 