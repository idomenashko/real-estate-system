const express = require('express');
const Property = require('../models/Property');
const { authenticateToken, optionalAuth } = require('../utils/auth');
const { validateProperty } = require('../utils/validation');

const router = express.Router();

// Get all properties with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      city,
      neighborhood,
      minPrice,
      maxPrice,
      minRooms,
      maxRooms,
      propertyType,
      isHotDeal,
      sourceWebsite,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = { status: 'active' };
    
    if (city) filter.city = new RegExp(city, 'i');
    if (neighborhood) filter.neighborhood = new RegExp(neighborhood, 'i');
    if (minPrice) filter.price = { $gte: parseInt(minPrice) };
    if (maxPrice) {
      filter.price = filter.price || {};
      filter.price.$lte = parseInt(maxPrice);
    }
    if (minRooms) filter.rooms = { $gte: parseFloat(minRooms) };
    if (maxRooms) {
      filter.rooms = filter.rooms || {};
      filter.rooms.$lte = parseFloat(maxRooms);
    }
    if (propertyType) filter.propertyType = propertyType;
    if (isHotDeal === 'true') filter.isHotDeal = true;
    if (sourceWebsite) filter.sourceWebsite = sourceWebsite;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const properties = await Property.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Property.countDocuments(filter);

    res.json({
      properties,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProperties: total,
        propertiesPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('שגיאה בקבלת נכסים:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בקבלת נכסים'
      }
    });
  }
});

// Get hot deals - MUST COME BEFORE /:propertyId
router.get('/hot-deals', optionalAuth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const hotDeals = await Property.find({
      isHotDeal: true,
      status: 'active'
    })
    .sort({ hotDealScore: -1, createdAt: -1 })
    .limit(parseInt(limit));

    res.json({ hotDeals });

  } catch (error) {
    console.error('שגיאה בקבלת עסקאות חמות:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בקבלת עסקאות חמות'
      }
    });
  }
});

// Get personalized hot deals based on user preferences - MUST COME BEFORE /:propertyId
router.get('/hot-deals/personalized', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const user = req.user;

    // Build filter based on user preferences
    const filter = {
      isHotDeal: true,
      status: 'active'
    };

    // Add user preference filters
    if (user.preferences) {
      const prefs = user.preferences;
      
      // Price range filter
      if (prefs.priceRange) {
        filter.price = {
          $gte: prefs.priceRange.min || 0,
          $lte: prefs.priceRange.max || 10000000
        };
      }

      // Cities filter
      if (prefs.cities && prefs.cities.length > 0) {
        filter.city = { $in: prefs.cities };
      }

      // Neighborhoods filter
      if (prefs.neighborhoods && prefs.neighborhoods.length > 0) {
        filter.neighborhood = { $in: prefs.neighborhoods };
      }

      // Property types filter
      if (prefs.propertyTypes && prefs.propertyTypes.length > 0) {
        filter.propertyType = { $in: prefs.propertyTypes };
      }

      // Rooms filter
      if (prefs.minRooms || prefs.maxRooms) {
        filter.rooms = {};
        if (prefs.minRooms) filter.rooms.$gte = prefs.minRooms;
        if (prefs.maxRooms) filter.rooms.$lte = prefs.maxRooms;
      }

      // Size filter
      if (prefs.minSize || prefs.maxSize) {
        filter.size = {};
        if (prefs.minSize) filter.size.$gte = prefs.minSize;
        if (prefs.maxSize) filter.size.$lte = prefs.maxSize;
      }

      // Eviction building filter
      if (prefs.includeEvictionBuilding === false) {
        filter.evictionBuilding = { $ne: true };
      }
    }

    const personalizedHotDeals = await Property.find(filter)
      .sort({ hotDealScore: -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ 
      personalizedHotDeals,
      userPreferences: user.preferences,
      totalFound: personalizedHotDeals.length
    });

  } catch (error) {
    console.error('שגיאה בקבלת עסקאות חמות מותאמות אישית:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בקבלת עסקאות חמות מותאמות אישית'
      }
    });
  }
});

// Get personalized properties based on user preferences - MUST COME BEFORE /:propertyId
router.get('/personalized', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      includeHotDeals = true
    } = req.query;
    
    const user = req.user;

    // Build filter based on user preferences
    const filter = {
      status: 'active'
    };

    // Add hot deals filter if requested
    if (includeHotDeals === 'true') {
      filter.isHotDeal = true;
    }

    // Add user preference filters
    if (user.preferences) {
      const prefs = user.preferences;
      
      // Price range filter
      if (prefs.priceRange) {
        filter.price = {
          $gte: prefs.priceRange.min || 0,
          $lte: prefs.priceRange.max || 10000000
        };
      }

      // Cities filter
      if (prefs.cities && prefs.cities.length > 0) {
        filter.city = { $in: prefs.cities };
      }

      // Neighborhoods filter
      if (prefs.neighborhoods && prefs.neighborhoods.length > 0) {
        filter.neighborhood = { $in: prefs.neighborhoods };
      }

      // Property types filter
      if (prefs.propertyTypes && prefs.propertyTypes.length > 0) {
        filter.propertyType = { $in: prefs.propertyTypes };
      }

      // Rooms filter
      if (prefs.minRooms || prefs.maxRooms) {
        filter.rooms = {};
        if (prefs.minRooms) filter.rooms.$gte = prefs.minRooms;
        if (prefs.maxRooms) filter.rooms.$lte = prefs.maxRooms;
      }

      // Size filter
      if (prefs.minSize || prefs.maxSize) {
        filter.size = {};
        if (prefs.minSize) filter.size.$gte = prefs.minSize;
        if (prefs.maxSize) filter.size.$lte = prefs.maxSize;
      }

      // Eviction building filter
      if (prefs.includeEvictionBuilding === false) {
        filter.evictionBuilding = { $ne: true };
      }
    }

    const personalizedProperties = await Property.find(filter)
      .sort({ isHotDeal: -1, hotDealScore: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Property.countDocuments(filter);

    res.json({
      properties: personalizedProperties,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProperties: total,
        propertiesPerPage: parseInt(limit)
      },
      userPreferences: user.preferences,
      includeHotDeals: includeHotDeals === 'true'
    });

  } catch (error) {
    console.error('שגיאה בקבלת נכסים מותאמים אישית:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בקבלת נכסים מותאמים אישית'
      }
    });
  }
});

// Manual scraping endpoint - MUST COME BEFORE /search
router.post('/scrape', async (req, res) => {
  try {
    const { filters = {} } = req.body;
    
    console.log('🔄 מתחיל סקרייפינג ידני...');
    console.log('📋 פילטרים:', filters);
    
    const scrapingService = require('../services/scrapingService');
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

// Auto-scraping endpoint - MUST COME BEFORE /search
router.post('/scrape/auto', async (req, res) => {
  try {
    const { filters = {} } = req.body;
    
    console.log('🔄 מתחיל סקרייפינג אוטומטי...');
    console.log('📋 פילטרים:', filters);
    
    const scrapingService = require('../services/scrapingService');
    
    // Run scraping in background
    scrapingService.scrapeAllWebsites(filters)
      .then(scrapedProperties => {
        console.log(`✅ סקרייפינג אוטומטי הושלם, נוספו ${scrapedProperties.length} נכסים`);
      })
      .catch(error => {
        console.error('❌ שגיאה בסקרייפינג אוטומטי:', error);
      });
    
    res.json({
      message: 'סקרייפינג אוטומטי התחיל ברקע',
      status: 'started'
    });
    
  } catch (error) {
    console.error('שגיאה בהתחלת סקרייפינג אוטומטי:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בהתחלת סקרייפינג אוטומטי'
      }
    });
  }
});

// Scrape properties by city - MUST COME BEFORE /search
router.post('/scrape/city/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const { filters = {} } = req.body;
    
    console.log(`🔄 מתחיל סקרייפינג לעיר: ${city}`);
    
    const scrapingService = require('../services/scrapingService');
    const cityFilters = { ...filters, city };
    
    const scrapedProperties = await scrapingService.scrapeAllWebsites(cityFilters);
    
    res.json({
      message: `סקרייפינג לעיר ${city} הושלם בהצלחה`,
      scrapedCount: scrapedProperties.length,
      city,
      properties: scrapedProperties
    });
    
  } catch (error) {
    console.error('שגיאה בסקרייפינג לפי עיר:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בסקרייפינג לפי עיר'
      }
    });
  }
});

// Scrape properties by price range - MUST COME BEFORE /search
router.post('/scrape/price-range', async (req, res) => {
  try {
    const { minPrice, maxPrice, filters = {} } = req.body;
    
    if (!minPrice && !maxPrice) {
      return res.status(400).json({
        error: {
          message: 'יש להזין טווח מחירים'
        }
      });
    }
    
    console.log(`🔄 מתחיל סקרייפינג לטווח מחירים: ${minPrice || 0} - ${maxPrice || 'ללא הגבלה'}`);
    
    const scrapingService = require('../services/scrapingService');
    const priceFilters = { ...filters, minPrice, maxPrice };
    
    const scrapedProperties = await scrapingService.scrapeAllWebsites(priceFilters);
    
    res.json({
      message: `סקרייפינג לטווח מחירים הושלם בהצלחה`,
      scrapedCount: scrapedProperties.length,
      priceRange: { minPrice, maxPrice },
      properties: scrapedProperties
    });
    
  } catch (error) {
    console.error('שגיאה בסקרייפינג לפי טווח מחירים:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בסקרייפינג לפי טווח מחירים'
      }
    });
  }
});

// Scrape properties by room count - MUST COME BEFORE /search
router.post('/scrape/rooms', async (req, res) => {
  try {
    const { minRooms, maxRooms, filters = {} } = req.body;
    
    if (!minRooms && !maxRooms) {
      return res.status(400).json({
        error: {
          message: 'יש להזין מספר חדרים'
        }
      });
    }
    
    console.log(`🔄 מתחיל סקרייפינג למספר חדרים: ${minRooms || 0} - ${maxRooms || 'ללא הגבלה'}`);
    
    const scrapingService = require('../services/scrapingService');
    const roomFilters = { ...filters, minRooms, maxRooms };
    
    const scrapedProperties = await scrapingService.scrapeAllWebsites(roomFilters);
    
    res.json({
      message: `סקרייפינג למספר חדרים הושלם בהצלחה`,
      scrapedCount: scrapedProperties.length,
      roomRange: { minRooms, maxRooms },
      properties: scrapedProperties
    });
    
  } catch (error) {
    console.error('שגיאה בסקרייפינג לפי מספר חדרים:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בסקרייפינג לפי מספר חדרים'
      }
    });
  }
});

// Scrape properties by property type - MUST COME BEFORE /search
router.post('/scrape/property-type', async (req, res) => {
  try {
    const { propertyType, filters = {} } = req.body;
    
    if (!propertyType) {
      return res.status(400).json({
        error: {
          message: 'יש להזין סוג נכס'
        }
      });
    }
    
    console.log(`🔄 מתחיל סקרייפינג לסוג נכס: ${propertyType}`);
    
    const scrapingService = require('../services/scrapingService');
    const typeFilters = { ...filters, propertyType };
    
    const scrapedProperties = await scrapingService.scrapeAllWebsites(typeFilters);
    
    res.json({
      message: `סקרייפינג לסוג נכס ${propertyType} הושלם בהצלחה`,
      scrapedCount: scrapedProperties.length,
      propertyType,
      properties: scrapedProperties
    });
    
  } catch (error) {
    console.error('שגיאה בסקרייפינג לפי סוג נכס:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בסקרייפינג לפי סוג נכס'
      }
    });
  }
});

// Get scraping status - MUST COME BEFORE /search
router.get('/scrape/status', async (req, res) => {
  try {
    const scrapingService = require('../services/scrapingService');
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

// Dynamic property search with automatic scraping
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const {
      city,
      neighborhood,
      minPrice,
      maxPrice,
      minRooms,
      maxRooms,
      propertyType,
      limit = 20,
      forceRefresh = false
    } = req.query;

    // Build filter
    const filter = { status: 'active' };
    
    if (city) filter.city = new RegExp(city, 'i');
    if (neighborhood) filter.neighborhood = new RegExp(neighborhood, 'i');
    if (minPrice) filter.price = { $gte: parseInt(minPrice) };
    if (maxPrice) {
      filter.price = filter.price || {};
      filter.price.$lte = parseInt(maxPrice);
    }
    if (minRooms) filter.rooms = { $gte: parseFloat(minRooms) };
    if (maxRooms) {
      filter.rooms = filter.rooms || {};
      filter.rooms.$lte = parseFloat(maxRooms);
    }
    if (propertyType) filter.propertyType = propertyType;

    // Check if we have enough properties in database
    let properties = await Property.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // If not enough properties or force refresh, trigger scraping
    if (properties.length < parseInt(limit) || forceRefresh === 'true') {
      console.log('🔍 לא מספיק נכסים, מתחיל סקרייפינג...');
      
      const scrapingService = require('../services/scrapingService');
      
      // Prepare scraping filters
      const scrapingFilters = {};
      if (city) scrapingFilters.city = city;
      if (minPrice) scrapingFilters.minPrice = parseInt(minPrice);
      if (maxPrice) scrapingFilters.maxPrice = parseInt(maxPrice);
      if (minRooms) scrapingFilters.minRooms = parseFloat(minRooms);
      
      // Run scraping in background
      scrapingService.scrapeAllWebsites(scrapingFilters)
        .then(scrapedProperties => {
          console.log(`✅ סקרייפינג הושלם, נוספו ${scrapedProperties.length} נכסים`);
        })
        .catch(error => {
          console.error('❌ שגיאה בסקרייפינג:', error);
        });
      
      // Return current properties immediately
      res.json({
        properties,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalProperties: properties.length,
          propertiesPerPage: properties.length
        },
        message: 'נכסים קיימים נשלחו, סקרייפינג מתבצע ברקע'
      });
    } else {
      // Return properties from database
      const total = await Property.countDocuments(filter);
      
      res.json({
        properties,
        pagination: {
          currentPage: 1,
          totalPages: Math.ceil(total / parseInt(limit)),
          totalProperties: total,
          propertiesPerPage: parseInt(limit)
        }
      });
    }

  } catch (error) {
    console.error('שגיאה בחיפוש נכסים:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בחיפוש נכסים'
      }
    });
  }
});

// Get property statistics - MUST COME BEFORE /:propertyId
router.get('/stats/overview', optionalAuth, async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments({ status: 'active' });
    const hotDealsCount = await Property.countDocuments({ isHotDeal: true, status: 'active' });
    const avgPrice = await Property.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]);

    const cities = await Property.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalProperties,
      hotDealsCount,
      averagePrice: Math.round(avgPrice[0]?.avgPrice || 0),
      topCities: cities
    });

  } catch (error) {
    console.error('שגיאה בקבלת סטטיסטיקות:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בקבלת סטטיסטיקות'
      }
    });
  }
});

// Get properties by city - MUST COME BEFORE /:propertyId
router.get('/city/:city', optionalAuth, async (req, res) => {
  try {
    const { city } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const properties = await Property.find({ city: new RegExp(city, 'i') })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Property.countDocuments({ city: new RegExp(city, 'i') });

    res.json({
      properties,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProperties: total,
        propertiesPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('שגיאה בקבלת נכסים לפי עיר:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בקבלת נכסים לפי עיר'
      }
    });
  }
});

// Get available cities - MUST COME BEFORE /:propertyId
router.get('/cities', optionalAuth, async (req, res) => {
  try {
    const cities = await Property.distinct('city');
    res.json({
      cities: cities.filter(city => city).sort()
    });
  } catch (error) {
    console.error('שגיאה בקבלת ערים:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בקבלת ערים'
      }
    });
  }
});

// Get market analysis for property - MUST COME BEFORE /:propertyId
router.get('/:propertyId/analysis', optionalAuth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    
    if (!property) {
      return res.status(404).json({
        error: {
          message: 'נכס לא נמצא'
        }
      });
    }

    // Get similar properties in the same area
    const similarProperties = await Property.find({
      city: property.city,
      neighborhood: property.neighborhood,
      propertyType: property.propertyType,
      rooms: { $gte: property.rooms - 0.5, $lte: property.rooms + 0.5 },
      _id: { $ne: property._id },
      status: 'active'
    })
    .sort({ createdAt: -1 })
    .limit(10);

    // Calculate average price in area
    const avgPriceInArea = similarProperties.length > 0
      ? similarProperties.reduce((sum, prop) => sum + prop.price, 0) / similarProperties.length
      : property.price;

    // Calculate price comparison
    const priceComparison = property.price / avgPriceInArea * 100;

    res.json({
      property,
      analysis: {
        averagePriceInArea: Math.round(avgPriceInArea),
        priceComparison: Math.round(priceComparison),
        similarProperties,
        isGoodDeal: priceComparison < 90, // 10% below average
        potentialSavings: Math.round(avgPriceInArea - property.price)
      }
    });

  } catch (error) {
    console.error('שגיאה בניתוח נכס:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בניתוח נכס'
      }
    });
  }
});

// Delete all properties - MUST COME BEFORE /:propertyId
router.delete('/all', async (req, res) => {
  try {
    const result = await Property.deleteMany({});
    
    res.json({
      message: 'כל הנכסים נמחקו בהצלחה',
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

// Get property by ID - MUST COME LAST (dynamic route)
router.get('/:propertyId', optionalAuth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    
    if (!property) {
      return res.status(404).json({
        error: {
          message: 'נכס לא נמצא'
        }
      });
    }

    res.json({ property });

  } catch (error) {
    console.error('שגיאה בקבלת נכס:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בקבלת נכס'
      }
    });
  }
});

module.exports = router; 