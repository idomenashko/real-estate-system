const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://real-estate-user:Noam1998!@cluster0.zhqlwoy.mongodb.net/real-estate-system?retryWrites=true&w=majority&appName=Cluster0')
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
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const adminUser = new User({
    name: 'מנהל המערכת',
    email: 'admin@real-estate.com',
    password: hashedPassword,
    phone: '050-1234567',
    role: 'admin',
    commissionPercentage: 3
  });

  await adminUser.save();
  console.log('✅ מנהל נוצר בהצלחה');
  console.log('📧 Email: admin@real-estate.com');
  console.log('🔑 Password: admin123');

  process.exit(0);
})
.catch((error) => {
  console.error('❌ שגיאה:', error);
  process.exit(1);
}); 