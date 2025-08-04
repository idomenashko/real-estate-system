const Joi = require('joi');

// Registration validation schema
const registrationSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'אימייל לא תקין',
      'any.required': 'אימייל הוא שדה חובה'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'סיסמה חייבת להכיל לפחות 6 תווים',
      'any.required': 'סיסמה היא שדה חובה'
    }),
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'שם חייב להכיל לפחות 2 תווים',
      'string.max': 'שם לא יכול להיות ארוך מ-50 תווים',
      'any.required': 'שם הוא שדה חובה'
    }),
  phone: Joi.string()
    .pattern(/^[0-9+\-\s()]+$/)
    .min(9)
    .max(15)
    .required()
    .messages({
      'string.pattern.base': 'מספר טלפון לא תקין',
      'string.min': 'מספר טלפון חייב להכיל לפחות 9 תווים',
      'string.max': 'מספר טלפון לא יכול להיות ארוך מ-15 תווים',
      'any.required': 'מספר טלפון הוא שדה חובה'
    })
});

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'אימייל לא תקין',
      'any.required': 'אימייל הוא שדה חובה'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'סיסמה היא שדה חובה'
    })
});

// Property preferences validation schema
const preferencesSchema = Joi.object({
  cities: Joi.array().items(Joi.string().trim()),
  neighborhoods: Joi.array().items(Joi.string().trim()),
  priceRange: Joi.object({
    min: Joi.number().min(0),
    max: Joi.number().min(0)
  }),
  propertyTypes: Joi.array().items(
    Joi.string().valid('apartment', 'house', 'penthouse', 'garden_apartment', 'duplex')
  ),
  minRooms: Joi.number().min(0.5).max(20),
  maxRooms: Joi.number().min(0.5).max(20),
  minSize: Joi.number().min(0),
  maxSize: Joi.number().min(0),
  includeEvictionBuilding: Joi.boolean()
});

// Property validation schema
const propertySchema = Joi.object({
  address: Joi.string().required(),
  city: Joi.string().required(),
  neighborhood: Joi.string().required(),
  street: Joi.string(),
  streetNumber: Joi.string(),
  propertyType: Joi.string().valid('apartment', 'house', 'penthouse', 'garden_apartment', 'duplex', 'land').required(),
  rooms: Joi.number().min(0.5).max(20).required(),
  size: Joi.number().min(1).required(),
  floor: Joi.number().min(-10).max(100),
  totalFloors: Joi.number().min(1).max(100),
  price: Joi.number().min(0).required(),
  condition: Joi.string().valid('excellent', 'good', 'fair', 'needs_renovation', 'new'),
  renovationRequired: Joi.boolean(),
  renovationCost: Joi.number().min(0),
  evictionBuilding: Joi.boolean(),
  evictionBuildingDetails: Joi.string(),
  parking: Joi.boolean(),
  elevator: Joi.boolean(),
  balcony: Joi.boolean(),
  garden: Joi.boolean(),
  sourceWebsite: Joi.string().valid('yad2', 'winwin', 'madlan', 'other').required(),
  sourceUrl: Joi.string().required(),
  sourceId: Joi.string(),
  contactName: Joi.string(),
  contactPhone: Joi.string(),
  contactEmail: Joi.string().email()
});

// Deal validation schema
const dealSchema = Joi.object({
  propertyId: Joi.string().required(),
  originalPrice: Joi.number().min(0).required(),
  commissionPercentage: Joi.number().min(0).max(10).required(),
  contactName: Joi.string(),
  contactPhone: Joi.string(),
  contactEmail: Joi.string().email()
});

// Validation functions
const validateRegistration = (data) => {
  return registrationSchema.validate(data);
};

const validateLogin = (data) => {
  return loginSchema.validate(data);
};

const validatePreferences = (data) => {
  return preferencesSchema.validate(data);
};

const validateProperty = (data) => {
  return propertySchema.validate(data);
};

const validateDeal = (data) => {
  return dealSchema.validate(data);
};

// Sanitize functions
const sanitizeEmail = (email) => {
  return email.toLowerCase().trim();
};

const sanitizePhone = (phone) => {
  return phone.replace(/[^\d+\-\(\)\s]/g, '').trim();
};

const sanitizeString = (str) => {
  return str.trim().replace(/\s+/g, ' ');
};

module.exports = {
  validateRegistration,
  validateLogin,
  validatePreferences,
  validateProperty,
  validateDeal,
  sanitizeEmail,
  sanitizePhone,
  sanitizeString
}; 