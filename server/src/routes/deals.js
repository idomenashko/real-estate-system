
const express = require('express');
const Deal = require('../models/Deal');
const Property = require('../models/Property');
const { authenticateToken, requireAgentOrAdmin } = require('../utils/auth');
const { validateDeal } = require('../utils/validation');

const router = express.Router();

// Create new deal
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error } = validateDeal(req.body);
    if (error) {
      return res.status(400).json({
        error: {
          message: error.details[0].message
        }
      });
    }

    const { propertyId, originalPrice, commissionPercentage, contactName, contactPhone, contactEmail } = req.body;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        error: {
          message: 'נכס לא נמצא'
        }
      });
    }

    // Check if deal already exists for this property and agent
    const existingDeal = await Deal.findOne({
      propertyId,
      agentId: req.user._id,
      status: { $nin: ['closed', 'cancelled'] }
    });

    if (existingDeal) {
      return res.status(400).json({
        error: {
          message: 'כבר קיימת עסקה פעילה עבור נכס זה'
        }
      });
    }

    // Create new deal
    const deal = new Deal({
      propertyId,
      agentId: req.user._id,
      originalPrice,
      commissionPercentage: commissionPercentage || req.user.commissionPercentage,
      contactName,
      contactPhone,
      contactEmail
    });

    await deal.save();

    // Populate property details
    await deal.populate('propertyId');

    res.status(201).json({
      message: 'עסקה נוצרה בהצלחה',
      deal
    });

  } catch (error) {
    console.error('שגיאה ביצירת עסקה:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה ביצירת עסקה'
      }
    });
  }
});

// Get user's deals
router.get('/my-deals', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { agentId: req.user._id };
    if (status) filter.status = status;

    const deals = await Deal.find(filter)
      .populate('propertyId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Deal.countDocuments(filter);

    res.json({
      deals,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalDeals: total,
        dealsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('שגיאה בקבלת עסקאות:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בקבלת עסקאות'
      }
    });
  }
});

// Get deal by ID
router.get('/:dealId', authenticateToken, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.dealId)
      .populate('propertyId')
      .populate('agentId', 'name email phone');

    if (!deal) {
      return res.status(404).json({
        error: {
          message: 'עסקה לא נמצאה'
        }
      });
    }

    // Check if user has access to this deal
    if (req.user.role !== 'admin' && deal.agentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: {
          message: 'אין לך הרשאה לצפות בעסקה זו'
        }
      });
    }

    res.json({ deal });

  } catch (error) {
    console.error('שגיאה בקבלת עסקה:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בקבלת עסקה'
      }
    });
  }
});

// Update deal status
router.put('/:dealId/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        error: {
          message: 'סטטוס עסקה נדרש'
        }
      });
    }

    const validStatuses = ['interested', 'contacted', 'viewing_scheduled', 'offer_made', 'negotiating', 'closed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: {
          message: 'סטטוס לא תקין'
        }
      });
    }

    const deal = await Deal.findById(req.params.dealId);

    if (!deal) {
      return res.status(404).json({
        error: {
          message: 'עסקה לא נמצאה'
        }
      });
    }

    // Check if user has access to this deal
    if (req.user.role !== 'admin' && deal.agentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: {
          message: 'אין לך הרשאה לעדכן עסקה זו'
        }
      });
    }

    await deal.updateStatus(status);

    res.json({
      message: 'סטטוס עסקה עודכן בהצלחה',
      deal
    });

  } catch (error) {
    console.error('שגיאה בעדכון סטטוס עסקה:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בעדכון סטטוס עסקה'
      }
    });
  }
});

// Add note to deal
router.post('/:dealId/notes', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: {
          message: 'תוכן הערה נדרש'
        }
      });
    }

    const deal = await Deal.findById(req.params.dealId);

    if (!deal) {
      return res.status(404).json({
        error: {
          message: 'עסקה לא נמצאה'
        }
      });
    }

    // Check if user has access to this deal
    if (req.user.role !== 'admin' && deal.agentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: {
          message: 'אין לך הרשאה להוסיף הערה לעסקה זו'
        }
      });
    }

    await deal.addNote(content.trim(), req.user._id);

    res.json({
      message: 'הערה נוספה בהצלחה',
      deal
    });

  } catch (error) {
    console.error('שגיאה בהוספת הערה:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בהוספת הערה'
      }
    });
  }
});

// Update deal details
router.put('/:dealId', authenticateToken, async (req, res) => {
  try {
    const { finalPrice, contactName, contactPhone, contactEmail } = req.body;

    const deal = await Deal.findById(req.params.dealId);

    if (!deal) {
      return res.status(404).json({
        error: {
          message: 'עסקה לא נמצאה'
        }
      });
    }

    // Check if user has access to this deal
    if (req.user.role !== 'admin' && deal.agentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: {
          message: 'אין לך הרשאה לעדכן עסקה זו'
        }
      });
    }

    const updates = {};
    if (finalPrice !== undefined) updates.finalPrice = finalPrice;
    if (contactName) updates.contactName = contactName.trim();
    if (contactPhone) updates.contactPhone = contactPhone.trim();
    if (contactEmail) updates.contactEmail = contactEmail.trim();

    const updatedDeal = await Deal.findByIdAndUpdate(
      req.params.dealId,
      updates,
      { new: true }
    ).populate('propertyId');

    res.json({
      message: 'עסקה עודכנה בהצלחה',
      deal: updatedDeal
    });

  } catch (error) {
    console.error('שגיאה בעדכון עסקה:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בעדכון עסקה'
      }
    });
  }
});

// Get all deals (admin only)
router.get('/', authenticateToken, requireAgentOrAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, agentId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (agentId) filter.agentId = agentId;

    const deals = await Deal.find(filter)
      .populate('propertyId')
      .populate('agentId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Deal.countDocuments(filter);

    res.json({
      deals,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalDeals: total,
        dealsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('שגיאה בקבלת כל העסקאות:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בקבלת כל העסקאות'
      }
    });
  }
});

// Get deal statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { agentId: req.user._id };

    const totalDeals = await Deal.countDocuments(filter);
    const activeDeals = await Deal.countDocuments({ ...filter, status: { $nin: ['closed', 'cancelled'] } });
    const closedDeals = await Deal.countDocuments({ ...filter, status: 'closed' });

    const totalCommission = await Deal.aggregate([
      { $match: { ...filter, status: 'closed' } },
      { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
    ]);

    const dealsByStatus = await Deal.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      totalDeals,
      activeDeals,
      closedDeals,
      totalCommission: Math.round(totalCommission[0]?.total || 0),
      dealsByStatus
    });

  } catch (error) {
    console.error('שגיאה בקבלת סטטיסטיקות עסקאות:', error);
    res.status(500).json({
      error: {
        message: 'שגיאה בקבלת סטטיסטיקות עסקאות'
      }
    });
  }
});

module.exports = router; 