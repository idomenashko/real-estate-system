const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-system')
.then(async () => {
  console.log('✅ התחברות למסד הנתונים הצליחה');

  // Check if admin already exists
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) {
    console.log('❌ מנהל כבר קיים במערכת');
    console.log('📧 Email:', existingAdmin.email);
    process.exit(0);
  }

  // Create admin user
  const adminUser = new User({
    name: 'מנהל המערכת',
    email: 'admin@real-estate.com',
    password: '123456',
    phone: '050-1234567',
    role: 'admin',
    commissionPercentage: 3
  });

  await adminUser.save();
  console.log('✅ מנהל נוצר בהצלחה');
  console.log('📧 Email: admin@real-estate.com');
  console.log('🔑 Password: 123456');

  process.exit(0);
})
.catch((error) => {
  console.error('❌ שגיאה:', error);
  process.exit(1);
}); 