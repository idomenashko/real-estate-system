const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  // Deal Information
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Deal Status
  status: {
    type: String,
    enum: ['interested', 'contacted', 'viewing_scheduled', 'offer_made', 'negotiating', 'closed', 'cancelled'],
    default: 'interested'
  },
  
  // Financial Details
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  finalPrice: {
    type: Number,
    min: 0
  },
  commissionPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  commissionAmount: {
    type: Number,
    min: 0
  },
  
  // Timeline
  interestedAt: {
    type: Date,
    default: Date.now
  },
  contactedAt: {
    type: Date
  },
  viewingScheduledAt: {
    type: Date
  },
  offerMadeAt: {
    type: Date
  },
  closedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  
  // Notes and Communication
  notes: [{
    content: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Contact Information
  contactName: {
    type: String,
    trim: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    trim: true
  },
  
  // Deal Analysis
  potentialProfit: {
    type: Number,
    min: 0
  },
  roi: {
    type: Number,
    min: 0
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
dealSchema.index({ agentId: 1, status: 1 });
dealSchema.index({ propertyId: 1 });
dealSchema.index({ createdAt: -1 });
dealSchema.index({ status: 1, createdAt: -1 });

// Calculate commission amount
dealSchema.pre('save', function(next) {
  if (this.finalPrice && this.commissionPercentage) {
    this.commissionAmount = Math.round(this.finalPrice * (this.commissionPercentage / 100));
  }
  next();
});

// Method to update deal status
dealSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  
  // Update relevant timestamp
  switch (newStatus) {
    case 'contacted':
      this.contactedAt = new Date();
      break;
    case 'viewing_scheduled':
      this.viewingScheduledAt = new Date();
      break;
    case 'offer_made':
      this.offerMadeAt = new Date();
      break;
    case 'closed':
      this.closedAt = new Date();
      break;
    case 'cancelled':
      this.cancelledAt = new Date();
      break;
  }
  
  return this.save();
};

// Method to add note
dealSchema.methods.addNote = function(content, userId) {
  this.notes.push({
    content,
    createdBy: userId
  });
  return this.save();
};

// Method to calculate ROI
dealSchema.methods.calculateROI = function() {
  if (!this.potentialProfit || !this.finalPrice) return 0;
  return Math.round((this.potentialProfit / this.finalPrice) * 100);
};

// Virtual for deal duration
dealSchema.virtual('duration').get(function() {
  if (!this.createdAt) return 0;
  const now = new Date();
  const created = new Date(this.createdAt);
  return Math.ceil((now - created) / (1000 * 60 * 60 * 24)); // days
});

// Virtual for is active
dealSchema.virtual('isActive').get(function() {
  return !['closed', 'cancelled'].includes(this.status);
});

module.exports = mongoose.model('Deal', dealSchema); 