const mongoose = require('mongoose');
const Property = require('./src/models/Property');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-system')
.then(async () => {
  console.log('✅ התחברות למסד הנתונים הצליחה');

  // Delete all existing properties
  console.log('🗑️ מוחק נכסים קיימים...');
  await Property.deleteMany({});
  console.log('✅ נכסים קיימים נמחקו');

  // Sample properties data with affordable prices
  const sampleProperties = [
    {
      address: 'רחוב רוטשילד 10, תל אביב',
      city: 'תל אביב',
      neighborhood: 'מרכז העיר',
      street: 'רוטשילד',
      streetNumber: '10',
      propertyType: 'apartment',
      rooms: 2,
      size: 45,
      floor: 2,
      totalFloors: 4,
      price: 450000,
      condition: 'good',
      renovationRequired: false,
      evictionBuilding: false,
      parking: false,
      elevator: false,
      balcony: true,
      garden: false,
      sourceWebsite: 'yad2',
      sourceUrl: 'https://www.yad2.co.il/realestate/item/201',
      sourceId: '201',
      isHotDeal: true,
      hotDealScore: 75,
      contactName: 'דנה כהן',
      contactPhone: '050-6666666',
      status: 'active'
    },
    {
      address: 'רחוב ויצמן 5, חיפה',
      city: 'חיפה',
      neighborhood: 'הדר',
      street: 'ויצמן',
      streetNumber: '5',
      propertyType: 'apartment',
      rooms: 3,
      size: 75,
      floor: 3,
      totalFloors: 5,
      price: 750000,
      condition: 'excellent',
      renovationRequired: false,
      evictionBuilding: false,
      parking: true,
      elevator: true,
      balcony: true,
      garden: false,
      sourceWebsite: 'winwin',
      sourceUrl: 'https://www.winwin.co.il/realestate/item/301',
      sourceId: '301',
      isHotDeal: true,
      hotDealScore: 88,
      contactName: 'עמית לוי',
      contactPhone: '050-7777777',
      status: 'active'
    },
    {
      address: 'רחוב יפו 8, ירושלים',
      city: 'ירושלים',
      neighborhood: 'מרכז העיר',
      street: 'יפו',
      streetNumber: '8',
      propertyType: 'apartment',
      rooms: 2.5,
      size: 60,
      floor: 4,
      totalFloors: 6,
      price: 550000,
      condition: 'fair',
      renovationRequired: true,
      renovationCost: 100000,
      evictionBuilding: false,
      parking: false,
      elevator: true,
      balcony: true,
      garden: false,
      sourceWebsite: 'madlan',
      sourceUrl: 'https://www.madlan.co.il/realestate/item/401',
      sourceId: '401',
      isHotDeal: true,
      hotDealScore: 72,
      contactName: 'שירה גולדברג',
      contactPhone: '050-8888888',
      status: 'active'
    },
    {
      address: 'רחוב דיזנגוף 25, תל אביב',
      city: 'תל אביב',
      neighborhood: 'דיזנגוף',
      street: 'דיזנגוף',
      streetNumber: '25',
      propertyType: 'apartment',
      rooms: 3,
      size: 80,
      floor: 5,
      totalFloors: 8,
      price: 950000,
      condition: 'excellent',
      renovationRequired: false,
      evictionBuilding: false,
      parking: true,
      elevator: true,
      balcony: true,
      garden: false,
      sourceWebsite: 'yad2',
      sourceUrl: 'https://www.yad2.co.il/realestate/item/501',
      sourceId: '501',
      isHotDeal: true,
      hotDealScore: 90,
      contactName: 'רון שפירא',
      contactPhone: '050-9999999',
      status: 'active'
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
      price: 850000,
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
      isHotDeal: true,
      hotDealScore: 78,
      contactName: 'מיכל רוזן',
      contactPhone: '050-1111111',
      status: 'active'
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
      price: 650000,
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
      isHotDeal: true,
      hotDealScore: 82,
      contactName: 'יוסי לוי',
      contactPhone: '050-5555555',
      status: 'active'
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
      isHotDeal: false,
      hotDealScore: 60,
      contactName: 'אבי כהן',
      contactPhone: '050-2222222',
      status: 'active'
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
      isHotDeal: false,
      hotDealScore: 45,
      contactName: 'דוד ישראלי',
      contactPhone: '050-5555555',
      status: 'active'
    }
  ];

  try {
    const insertedProperties = await Property.insertMany(sampleProperties);
    console.log('✅ נכסים נוצרו בהצלחה');
    console.log(`📊 נוצרו ${insertedProperties.length} נכסים`);
    
    // Count hot deals
    const hotDealsCount = insertedProperties.filter(p => p.isHotDeal).length;
    console.log(`🔥 ${hotDealsCount} נכסים חמים`);
    
    // Count by city
    const cityCounts = {};
    insertedProperties.forEach(p => {
      cityCounts[p.city] = (cityCounts[p.city] || 0) + 1;
    });
    console.log('🏙️ נכסים לפי עיר:');
    Object.entries(cityCounts).forEach(([city, count]) => {
      console.log(`   ${city}: ${count} נכסים`);
    });
    
    // Show price range
    const prices = insertedProperties.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    console.log(`💰 טווח מחירים: ₪${minPrice.toLocaleString()} - ₪${maxPrice.toLocaleString()}`);
    
    // Show properties in 400K-1M range
    const affordableProperties = insertedProperties.filter(p => p.price >= 400000 && p.price <= 1000000);
    console.log(`💡 ${affordableProperties.length} נכסים בטווח 400K-1M:`);
    affordableProperties.forEach(p => {
      console.log(`   ${p.address} - ₪${p.price.toLocaleString()} (${p.rooms} חדרים)`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ שגיאה ביצירת נכסים:', error);
    process.exit(1);
  }
})
.catch((error) => {
  console.error('❌ שגיאה:', error);
  process.exit(1);
}); 