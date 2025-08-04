const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  // Basic Information
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  neighborhood: {
    type: String,
    required: true,
    trim: true
  },
  street: {
    type: String,
    trim: true
  },
  streetNumber: {
    type: String,
    trim: true
  },
  
  // Property Details
  propertyType: {
    type: String,
    enum: ['apartment', 'house', 'penthouse', 'garden_apartment', 'duplex', 'land'],
    required: true
  },
  rooms: {
    type: Number,
    required: true,
    min: 0.5,
    max: 20
  },
  size: {
    type: Number,
    required: true,
    min: 1
  },
  floor: {
    type: Number,
    min: -10,
    max: 100
  },
  totalFloors: {
    type: Number,
    min: 1,
    max: 100
  },
  
  // Financial Information
  price: {
    type: Number,
    required: true,
    min: 0
  },
  pricePerSquareMeter: {
    type: Number,
    min: 0
  },
  estimatedMarketValue: {
    type: Number,
    min: 0
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Property Condition
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'needs_renovation', 'new'],
    default: 'good'
  },
  renovationRequired: {
    type: Boolean,
    default: false
  },
  renovationCost: {
    type: Number,
    min: 0
  },
  
  // Special Features
  evictionBuilding: {
    type: Boolean,
    default: false
  },
  evictionBuildingDetails: {
    type: String,
    trim: true
  },
  parking: {
    type: Boolean,
    default: false
  },
  elevator: {
    type: Boolean,
    default: false
  },
  balcony: {
    type: Boolean,
    default: false
  },
  garden: {
    type: Boolean,
    default: false
  },
  
  // Source Information
  sourceWebsite: {
    type: String,
    required: true,
    enum: ['yad2', 'winwin', 'madlan', 'other']
  },
  sourceUrl: {
    type: String,
    required: true,
    trim: true
  },
  sourceId: {
    type: String,
    trim: true
  },
  
  // Analysis Results
  isHotDeal: {
    type: Boolean,
    default: false
  },
  hotDealScore: {
    type: Number,
    min: 0,
    max: 100
  },
  marketAnalysis: {
    averagePriceInArea: {
      type: Number,
      min: 0
    },
    priceComparison: {
      type: Number,
      min: 0,
      max: 100
    },
    similarPropertiesSold: [{
      address: String,
      price: Number,
      soldDate: Date,
      pricePerSquareMeter: Number
    }],
    areaTrend: {
      type: String,
      enum: ['rising', 'stable', 'declining']
    }
  },
  
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
  
  // Status
  status: {
    type: String,
    enum: ['active', 'sold', 'removed', 'pending'],
    default: 'active'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastChecked: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
propertySchema.index({ city: 1, neighborhood: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ isHotDeal: 1 });
propertySchema.index({ sourceWebsite: 1, sourceId: 1 }, { unique: true });
propertySchema.index({ createdAt: -1 });

// Calculate price per square meter
propertySchema.pre('save', function(next) {
  if (this.price && this.size) {
    this.pricePerSquareMeter = Math.round(this.price / this.size);
  }
  
  if (this.estimatedMarketValue && this.price) {
    this.discountPercentage = Math.round(((this.estimatedMarketValue - this.price) / this.estimatedMarketValue) * 100);
  }
  
  next();
});

// Virtual for full address
propertySchema.virtual('fullAddress').get(function() {
  return `${this.street} ${this.streetNumber}, ${this.neighborhood}, ${this.city}`;
});

// Method to check if property is still available
propertySchema.methods.isAvailable = function() {
  return this.status === 'active';
};

// Method to calculate potential profit
propertySchema.methods.calculatePotentialProfit = function() {
  if (!this.estimatedMarketValue || !this.price) return 0;
  return this.estimatedMarketValue - this.price;
};

module.exports = mongoose.model('Property', propertySchema); 