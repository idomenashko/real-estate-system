const express = require('express');
const { authenticateToken, requireAdmin } = require('../utils/auth');
const scrapingService = require('../services/scrapingService');
const Property = require('../models/Property');

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Trigger manual scraping
router.post('/scrape', async (req, res) => {
  try {
    const { filters = {} } = req.body;
    
    console.log('🔄 מתחיל סקרייפינג ידני...');
    
    const scrapedProperties = await scrapingService.scrapeAllWebsites(filters);
    
    res.json({
      message: 'סקרייפינג הושלם בהצלחה',
      scrapedCount: scrapedProperties.length,
      properties: scrapedProperties
    });
    
  } catch (error) {
    console.error('שגיאה בסקרייפינג:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בסקרייפינג'
      }
    });
  }
});

// Start continuous scraping
router.post('/scrape/start', async (req, res) => {
  try {
    const { intervalMinutes = 60 } = req.body;
    
    await scrapingService.startContinuousScraping(intervalMinutes);
    
    res.json({
      message: 'סקרייפינג רציף התחיל',
      intervalMinutes
    });
    
  } catch (error) {
    console.error('שגיאה בהתחלת סקרייפינג רציף:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בהתחלת סקרייפינג רציף'
      }
    });
  }
});

// Get scraping status
router.get('/scrape/status', async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments();
    const hotDealsCount = await Property.countDocuments({ isHotDeal: true });
    const recentProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      totalProperties,
      hotDealsCount,
      recentProperties,
      isScrapingRunning: scrapingService.isRunning
    });
    
  } catch (error) {
    console.error('שגיאה בקבלת סטטוס סקרייפינג:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בקבלת סטטוס סקרייפינג'
      }
    });
  }
});

// Get properties by source
router.get('/properties/by-source', async (req, res) => {
  try {
    const { source } = req.query;
    
    const filter = source ? { sourceWebsite: source } : {};
    const properties = await Property.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);
    
    const stats = await Property.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$sourceWebsite',
          count: { $sum: 1 },
          hotDealsCount: {
            $sum: { $cond: ['$isHotDeal', 1, 0] }
          },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);
    
    res.json({
      properties,
      stats
    });
    
  } catch (error) {
    console.error('שגיאה בקבלת נכסים לפי מקור:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בקבלת נכסים לפי מקור'
      }
    });
  }
});

// Delete properties by source
router.delete('/properties/by-source', async (req, res) => {
  try {
    const { source } = req.query;
    
    if (!source) {
      return res.status(400).json({
        error: {
          message: 'מקור נדרש'
        }
      });
    }
    
    const result = await Property.deleteMany({ sourceWebsite: source });
    
    res.json({
      message: `נמחקו ${result.deletedCount} נכסים מ-${source}`,
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error('שגיאה במחיקת נכסים:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה במחיקת נכסים'
      }
    });
  }
});

// Update property hot deal status
router.put('/properties/:propertyId/hot-deal', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { isHotDeal, hotDealScore } = req.body;
    
    const property = await Property.findByIdAndUpdate(
      propertyId,
      { isHotDeal, hotDealScore },
      { new: true }
    );
    
    if (!property) {
      return res.status(404).json({
        error: {
          message: 'נכס לא נמצא'
        }
      });
    }
    
    res.json({
      message: 'סטטוס עסקה חמה עודכן',
      property
    });
    
  } catch (error) {
    console.error('שגיאה בעדכון סטטוס עסקה חמה:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בעדכון סטטוס עסקה חמה'
      }
    });
  }
});

module.exports = router; 