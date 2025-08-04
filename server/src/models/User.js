const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'agent'],
    default: 'agent'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    cities: [{
      type: String,
      trim: true
    }],
    neighborhoods: [{
      type: String,
      trim: true
    }],
    priceRange: {
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 10000000
      }
    },
    propertyTypes: [{
      type: String,
      enum: ['apartment', 'house', 'penthouse', 'garden_apartment', 'duplex']
    }],
    minRooms: {
      type: Number,
      default: 1
    },
    maxRooms: {
      type: Number,
      default: 10
    },
    minSize: {
      type: Number,
      default: 0
    },
    maxSize: {
      type: Number,
      default: 1000
    },
    includeEvictionBuilding: {
      type: Boolean,
      default: true
    }
  },
  commissionPercentage: {
    type: Number,
    default: 2.5,
    min: 0,
    max: 10
  },
  notificationSettings: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['immediate', 'hourly', 'daily'],
      default: 'immediate'
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema); 