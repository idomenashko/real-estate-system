const mongoose = require('mongoose');

// Test connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-system')
.then(() => {
  console.log('✅ MongoDB connection successful');
  process.exit(0);
})
.catch((error) => {
  console.error('❌ MongoDB connection failed:', error);
  process.exit(1);
}); 