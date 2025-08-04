const express = require('express');
const User = require('../models/User');
const Property = require('../models/Property');
const Deal = require('../models/Deal');
const { authenticateToken, requireAdmin } = require('../utils/auth');

const router = express.Router();

// Get system overview statistics
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalProperties = await Property.countDocuments();
    const activeProperties = await Property.countDocuments({ status: 'active' });
    const hotDeals = await Property.countDocuments({ isHotDeal: true, status: 'active' });
    const totalDeals = await Deal.countDocuments();
    const closedDeals = await Deal.countDocuments({ status: 'closed' });

    const totalCommission = await Deal.aggregate([
      { $match: { status: 'closed' } },
      { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const propertiesBySource = await Property.aggregate([
      { $group: { _id: '$sourceWebsite', count: { $sum: 1 } } }
    ]);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        byRole: usersByRole
      },
      properties: {
        total: totalProperties,
        active: activeProperties,
        hotDeals,
        bySource: propertiesBySource
      },
      deals: {
        total: totalDeals,
        closed: closedDeals,
        totalCommission: Math.round(totalCommission[0]?.total || 0)
      }
    });

  } catch (error) {
    console.error('שגיאה בקבלת סטטיסטיקות מערכת:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בקבלת סטטיסטיקות מערכת'
      }
    });
  }
});

// Get recent activity
router.get('/activity/recent', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const recentProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) / 2);

    const recentDeals = await Deal.find()
      .populate('agentId', 'name')
      .populate('propertyId', 'address city')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) / 2);

    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      recentProperties,
      recentDeals,
      recentUsers
    });

  } catch (error) {
    console.error('שגיאה בקבלת פעילות אחרונה:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בקבלת פעילות אחרונה'
      }
    });
  }
});

// Get system health
router.get('/health', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    res.json({
      status: 'OK',
      database: dbStatus,
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) // MB
      },
      uptime: Math.round(uptime), // seconds
      environment: process.env.NODE_ENV
    });

  } catch (error) {
    console.error('שגיאה בבדיקת בריאות המערכת:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בבדיקת בריאות המערכת'
      }
    });
  }
});

// Update system settings
router.put('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      marketValueThreshold, 
      hotDealThreshold, 
      updateIntervalMinutes,
      emailNotifications 
    } = req.body;

    // This would typically update environment variables or a settings collection
    // For now, just return success
    res.json({
      message: 'הגדרות מערכת עודכנו בהצלחה',
      settings: {
        marketValueThreshold,
        hotDealThreshold,
        updateIntervalMinutes,
        emailNotifications
      }
    });

  } catch (error) {
    console.error('שגיאה בעדכון הגדרות מערכת:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בעדכון הגדרות מערכת'
      }
    });
  }
});

// Trigger manual property update
router.post('/properties/update', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // This would trigger the property scraping service
    // For now, just return success
    res.json({
      message: 'עדכון נכסים הופעל בהצלחה',
      status: 'running'
    });

  } catch (error) {
    console.error('שגיאה בהפעלת עדכון נכסים:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בהפעלת עדכון נכסים'
      }
    });
  }
});

// Get system logs
router.get('/logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { level = 'error', limit = 100 } = req.query;

    // This would typically read from a log file or database
    // For now, return empty array
    res.json({
      logs: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalLogs: 0,
        logsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('שגיאה בקבלת לוגים:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בקבלת לוגים'
      }
    });
  }
});

module.exports = router; 