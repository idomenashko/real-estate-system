const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'יותר מדי בקשות, נסה שוב מאוחר יותר'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ התחברות למסד הנתונים הצליחה');
})
.catch((error) => {
  console.error('❌ שגיאה בהתחברות למסד הנתונים:', error);
  process.exit(1);
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const propertyRoutes = require('./routes/properties');
const dealRoutes = require('./routes/deals');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ברוכים הבאים למערכת הנדל"ן',
    version: '1.0.0',
    status: 'running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ שגיאת שרת:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'שגיאה פנימית בשרת';
  
  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'הנתיב לא נמצא'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 השרת פועל על פורט ${PORT}`);
  console.log(`📊 סביבה: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API זמין ב: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 קבלת SIGTERM, סוגר שרת...');
  mongoose.connection.close();
  console.log('✅ חיבור למסד הנתונים נסגר');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 קבלת SIGINT, סוגר שרת...');
  mongoose.connection.close();
  console.log('✅ חיבור למסד הנתונים נסגר');
  process.exit(0);
});

module.exports = app; 