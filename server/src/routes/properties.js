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

// Search properties - MUST COME BEFORE /:propertyId
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const {
      query,
      page = 1,
      limit = 20
    } = req.query;

    if (!query) {
      return res.status(400).json({
        error: {
          message: 'חיפוש נדרש'
        }
      });
    }

    const searchFilter = {
      status: 'active',
      $or: [
        { address: new RegExp(query, 'i') },
        { city: new RegExp(query, 'i') },
        { neighborhood: new RegExp(query, 'i') },
        { street: new RegExp(query, 'i') }
      ]
    };

    const properties = await Property.find(searchFilter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Property.countDocuments(searchFilter);

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