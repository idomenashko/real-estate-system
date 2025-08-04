const mongoose = require('mongoose');
const Property = require('./src/models/Property');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-system')
.then(async () => {
  console.log('✅ התחברות למסד הנתונים הצליחה');

  // Check if properties already exist
  const existingProperties = await Property.countDocuments();
  if (existingProperties > 0) {
    console.log(`❌ כבר יש ${existingProperties} נכסים במסד הנתונים`);
    console.log('💡 אם אתה רוצה ליצור נכסים חדשים, מחק קודם את הקיימים');
    process.exit(0);
  }

  // Sample properties data
  const sampleProperties = [
    {
      address: 'רחוב הרצל 15, תל אביב',
      city: 'תל אביב',
      neighborhood: 'הרצליה',
      street: 'הרצל',
      streetNumber: '15',
      propertyType: 'apartment',
      rooms: 3.5,
      size: 85,
      floor: 4,
      totalFloors: 8,
      price: 2500000,
      condition: 'good',
      renovationRequired: false,
      evictionBuilding: false,
      parking: true,
      elevator: true,
      balcony: true,
      garden: false,
      sourceWebsite: 'yad2',
      sourceUrl: 'https://www.yad2.co.il/realestate/item/123',
      sourceId: '123',
      contactName: 'יוסי כהן',
      contactPhone: '050-1234567',
      isHotDeal: true,
      hotDealScore: 85,
      status: 'active',
      description: 'דירה יפה במרכז תל אביב, קרובה לתחבורה ציבורית'
    },
    {
      address: 'רחוב ויצמן 8, חיפה',
      city: 'חיפה',
      neighborhood: 'הדר',
      street: 'ויצמן',
      streetNumber: '8',
      propertyType: 'apartment',
      rooms: 4,
      size: 120,
      floor: 2,
      totalFloors: 6,
      price: 1800000,
      condition: 'excellent',
      renovationRequired: false,
      evictionBuilding: false,
      parking: true,
      elevator: true,
      balcony: true,
      garden: true,
      sourceWebsite: 'winwin',
      sourceUrl: 'https://www.winwin.co.il/realestate/item/456',
      sourceId: '456',
      contactName: 'שרה לוי',
      contactPhone: '050-9876543',
      isHotDeal: true,
      hotDealScore: 92,
      status: 'active',
      description: 'דירה מרווחת עם גינה פרטית, נוף לים'
    },
    {
      address: 'רחוב בן גוריון 22, ירושלים',
      city: 'ירושלים',
      neighborhood: 'רחביה',
      street: 'בן גוריון',
      streetNumber: '22',
      propertyType: 'penthouse',
      rooms: 5,
      size: 180,
      floor: 6,
      totalFloors: 6,
      price: 4200000,
      condition: 'excellent',
      renovationRequired: false,
      evictionBuilding: false,
      parking: true,
      elevator: true,
      balcony: true,
      garden: true,
      sourceWebsite: 'madlan',
      sourceUrl: 'https://www.madlan.co.il/realestate/item/789',
      sourceId: '789',
      contactName: 'דוד ישראלי',
      contactPhone: '050-5555555',
      isHotDeal: false,
      hotDealScore: 45,
      status: 'active',
      description: 'נטהאוס יוקרתי עם נוף פנורמי לעיר העתיקה'
    },
    {
      address: 'רחוב אלנבי 45, תל אביב',
      city: 'תל אביב',
      neighborhood: 'פלורנטין',
      street: 'אלנבי',
      streetNumber: '45',
      propertyType: 'apartment',
      rooms: 2.5,
      size: 65,
      floor: 3,
      totalFloors: 5,
      price: 1800000,
      condition: 'needs_renovation',
      renovationRequired: true,
      renovationCost: 200000,
      evictionBuilding: false,
      parking: false,
      elevator: false,
      balcony: true,
      garden: false,
      sourceWebsite: 'yad2',
      sourceUrl: 'https://www.yad2.co.il/realestate/item/101',
      sourceId: '101',
      contactName: 'מיכל רוזן',
      contactPhone: '050-1111111',
      isHotDeal: true,
      hotDealScore: 78,
      status: 'active',
      description: 'דירה זולה באזור מתפתח, פוטנציאל השקעה'
    },
    {
      address: 'רחוב הרצל 30, חיפה',
      city: 'חיפה',
      neighborhood: 'הדר',
      street: 'הרצל',
      streetNumber: '30',
      propertyType: 'house',
      rooms: 6,
      size: 200,
      floor: 1,
      totalFloors: 2,
      price: 3500000,
      condition: 'good',
      renovationRequired: false,
      evictionBuilding: false,
      parking: true,
      elevator: false,
      balcony: true,
      garden: true,
      sourceWebsite: 'winwin',
      sourceUrl: 'https://www.winwin.co.il/realestate/item/202',
      sourceId: '202',
      contactName: 'אבי כהן',
      contactPhone: '050-2222222',
      isHotDeal: false,
      hotDealScore: 60,
      status: 'active',
      description: 'בית פרטי עם גינה גדולה, מתאים למשפחה'
    },
    {
      address: 'רחוב יפו 12, ירושלים',
      city: 'ירושלים',
      neighborhood: 'מרכז העיר',
      street: 'יפו',
      streetNumber: '12',
      propertyType: 'apartment',
      rooms: 3,
      size: 90,
      floor: 5,
      totalFloors: 7,
      price: 2200000,
      condition: 'excellent',
      renovationRequired: false,
      evictionBuilding: false,
      parking: true,
      elevator: true,
      balcony: true,
      garden: false,
      sourceWebsite: 'madlan',
      sourceUrl: 'https://www.madlan.co.il/realestate/item/303',
      sourceId: '303',
      contactName: 'רחל גולדברג',
      contactPhone: '050-3333333',
      isHotDeal: true,
      hotDealScore: 88,
      status: 'active',
      description: 'דירה מעוצבת במרכז ירושלים, קרובה לכל השירותים'
    },
    {
      address: 'רחוב דיזנגוף 78, תל אביב',
      city: 'תל אביב',
      neighborhood: 'דיזנגוף',
      street: 'דיזנגוף',
      streetNumber: '78',
      propertyType: 'garden_apartment',
      rooms: 4.5,
      size: 140,
      floor: 1,
      totalFloors: 4,
      price: 3800000,
      condition: 'excellent',
      renovationRequired: false,
      evictionBuilding: false,
      parking: true,
      elevator: true,
      balcony: true,
      garden: true,
      sourceWebsite: 'yad2',
      sourceUrl: 'https://www.yad2.co.il/realestate/item/404',
      sourceId: '404',
      contactName: 'עדי שפירא',
      contactPhone: '050-4444444',
      isHotDeal: true,
      hotDealScore: 95,
      status: 'active',
      description: 'דירת גן יוקרתית עם גינה פרטית, מיקום מעולה'
    },
    {
      address: 'רחוב ויצמן 15, חיפה',
      city: 'חיפה',
      neighborhood: 'הדר',
      street: 'ויצמן',
      streetNumber: '15',
      propertyType: 'apartment',
      rooms: 2,
      size: 55,
      floor: 4,
      totalFloors: 6,
      price: 1200000,
      condition: 'fair',
      renovationRequired: true,
      renovationCost: 150000,
      evictionBuilding: false,
      parking: false,
      elevator: true,
      balcony: true,
      garden: false,
      sourceWebsite: 'winwin',
      sourceUrl: 'https://www.winwin.co.il/realestate/item/505',
      sourceId: '505',
      contactName: 'יוסי לוי',
      contactPhone: '050-5555555',
      isHotDeal: true,
      hotDealScore: 82,
      status: 'active',
      description: 'דירה זולה עם פוטנציאל שיפוץ, מיקום טוב'
    }
  ];

  // Insert properties
  const insertedProperties = await Property.insertMany(sampleProperties);
  
  console.log('✅ נכסים נוצרו בהצלחה');
  console.log(`📊 נוצרו ${insertedProperties.length} נכסים`);
  
  // Count hot deals
  const hotDealsCount = insertedProperties.filter(p => p.isHotDeal).length;
  console.log(`🔥 נכסים חמים: ${hotDealsCount}`);
  
  // Show cities distribution
  const cities = [...new Set(insertedProperties.map(p => p.city))];
  console.log(`🏙️ ערים: ${cities.join(', ')}`);
  
  console.log('\n📋 פרטי נכסים:');
  insertedProperties.forEach((property, index) => {
    console.log(`${index + 1}. ${property.address} - ₪${property.price.toLocaleString()} ${property.isHotDeal ? '🔥' : ''}`);
  });

  process.exit(0);
})
.catch((error) => {
  console.error('❌ שגיאה:', error);
  process.exit(1);
}); 