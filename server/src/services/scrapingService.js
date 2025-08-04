const axios = require('axios');
const cheerio = require('cheerio');
const Property = require('../models/Property');

class ScrapingService {
  constructor() {
    this.sources = {
      yad2: {
        baseUrl: 'https://www.yad2.co.il/api/feed/get',
        searchUrl: 'https://www.yad2.co.il/realestate/forsale',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      },
      winwin: {
        baseUrl: 'https://www.winwin.co.il',
        searchUrl: 'https://www.winwin.co.il/real-estate/sale',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      },
      madlan: {
        baseUrl: 'https://www.madlan.co.il',
        searchUrl: 'https://www.madlan.co.il/real-estate/sale',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    };
  }

  // Main scraping function
  async scrapeAllSources() {
    console.log('🚀 מתחיל איסוף נתונים מכל המקורות...');
    
    try {
      const results = await Promise.allSettled([
        this.scrapeYad2(),
        this.scrapeWinWin(),
        this.scrapeMadlan()
      ]);

      let totalNewProperties = 0;
      let totalHotDeals = 0;

      results.forEach((result, index) => {
        const sourceName = ['Yad2', 'WinWin', 'Madlan'][index];
        if (result.status === 'fulfilled') {
          console.log(`✅ ${sourceName}: ${result.value.newProperties} נכסים חדשים, ${result.value.hotDeals} עסקאות חמות`);
          totalNewProperties += result.value.newProperties;
          totalHotDeals += result.value.hotDeals;
        } else {
          console.log(`❌ ${sourceName}: שגיאה - ${result.reason.message}`);
        }
      });

      console.log(`📊 סה"כ: ${totalNewProperties} נכסים חדשים, ${totalHotDeals} עסקאות חמות`);
      return { totalNewProperties, totalHotDeals };
    } catch (error) {
      console.error('שגיאה באיסוף נתונים:', error);
      throw error;
    }
  }

  // Yad2 Scraping
  async scrapeYad2() {
    try {
      console.log('🔍 אוסף נתונים מ-Yad2...');
      
      const properties = [];
      const cities = ['תל אביב', 'רמת גן', 'חיפה', 'ירושלים', 'באר שבע'];
      
      for (const city of cities) {
        const cityProperties = await this.scrapeYad2City(city);
        properties.push(...cityProperties);
      }

      const { newProperties, hotDeals } = await this.saveProperties(properties, 'yad2');
      return { newProperties, hotDeals };
    } catch (error) {
      console.error('שגיאה באיסוף מ-Yad2:', error);
      throw error;
    }
  }

  async scrapeYad2City(city) {
    try {
      const response = await axios.get(`${this.sources.yad2.baseUrl}`, {
        params: {
          city: city,
          category: 'realestate',
          subcategory: 'forsale',
          page: 1,
          limit: 50
        },
        headers: this.sources.yad2.headers,
        timeout: 10000
      });

      const properties = [];
      if (response.data && response.data.feed) {
        for (const item of response.data.feed) {
          try {
            const property = this.parseYad2Property(item, city);
            if (property) {
              properties.push(property);
            }
          } catch (parseError) {
            console.error('שגיאה בפרסור נכס Yad2:', parseError);
          }
        }
      }

      return properties;
    } catch (error) {
      console.error(`שגיאה באיסוף מ-Yad2 עבור ${city}:`, error);
      return [];
    }
  }

  parseYad2Property(item, city) {
    try {
      // Extract price
      const priceText = item.price || item.price_text || '';
      const price = this.extractPrice(priceText);

      // Extract rooms
      const roomsText = item.rooms || item.room_text || '';
      const rooms = this.extractRooms(roomsText);

      // Extract size
      const sizeText = item.size || item.size_text || '';
      const size = this.extractSize(sizeText);

      // Extract address
      const address = item.address || item.street || '';
      const neighborhood = item.neighborhood || '';

      if (!price || !rooms || !size || !address) {
        return null;
      }

      // Calculate if it's a hot deal
      const pricePerSquareMeter = Math.round(price / size);
      const isHotDeal = this.isHotDeal(pricePerSquareMeter, city, neighborhood);

      return {
        address: `${address}, ${neighborhood}`,
        city: city,
        neighborhood: neighborhood,
        propertyType: this.determinePropertyType(item),
        rooms: rooms,
        size: size,
        price: price,
        pricePerSquareMeter: pricePerSquareMeter,
        condition: this.determineCondition(item),
        sourceWebsite: 'yad2',
        sourceUrl: item.url || '',
        sourceId: item.id || '',
        isHotDeal: isHotDeal,
        hotDealScore: isHotDeal ? this.calculateHotDealScore(pricePerSquareMeter, city) : 0,
        contactName: item.contact_name || '',
        contactPhone: item.contact_phone || '',
        contactEmail: item.contact_email || '',
        parking: this.extractBoolean(item.parking),
        elevator: this.extractBoolean(item.elevator),
        balcony: this.extractBoolean(item.balcony),
        garden: this.extractBoolean(item.garden),
        evictionBuilding: this.extractBoolean(item.eviction_building)
      };
    } catch (error) {
      console.error('שגיאה בפרסור נכס Yad2:', error);
      return null;
    }
  }

  // WinWin Scraping
  async scrapeWinWin() {
    try {
      console.log('🔍 אוסף נתונים מ-WinWin...');
      
      const response = await axios.get(this.sources.winwin.searchUrl, {
        headers: this.sources.winwin.headers,
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const properties = [];

      // Parse WinWin HTML structure
      $('.property-item').each((index, element) => {
        try {
          const property = this.parseWinWinProperty($, element);
          if (property) {
            properties.push(property);
          }
        } catch (parseError) {
          console.error('שגיאה בפרסור נכס WinWin:', parseError);
        }
      });

      const { newProperties, hotDeals } = await this.saveProperties(properties, 'winwin');
      return { newProperties, hotDeals };
    } catch (error) {
      console.error('שגיאה באיסוף מ-WinWin:', error);
      throw error;
    }
  }

  parseWinWinProperty($, element) {
    try {
      const priceText = $(element).find('.price').text();
      const price = this.extractPrice(priceText);

      const roomsText = $(element).find('.rooms').text();
      const rooms = this.extractRooms(roomsText);

      const sizeText = $(element).find('.size').text();
      const size = this.extractSize(sizeText);

      const address = $(element).find('.address').text().trim();
      const city = $(element).find('.city').text().trim();

      if (!price || !rooms || !size || !address) {
        return null;
      }

      const pricePerSquareMeter = Math.round(price / size);
      const isHotDeal = this.isHotDeal(pricePerSquareMeter, city, '');

      return {
        address: address,
        city: city,
        neighborhood: '',
        propertyType: 'apartment',
        rooms: rooms,
        size: size,
        price: price,
        pricePerSquareMeter: pricePerSquareMeter,
        condition: 'good',
        sourceWebsite: 'winwin',
        sourceUrl: $(element).find('a').attr('href') || '',
        sourceId: $(element).attr('data-id') || '',
        isHotDeal: isHotDeal,
        hotDealScore: isHotDeal ? this.calculateHotDealScore(pricePerSquareMeter, city) : 0
      };
    } catch (error) {
      console.error('שגיאה בפרסור נכס WinWin:', error);
      return null;
    }
  }

  // Madlan Scraping
  async scrapeMadlan() {
    try {
      console.log('🔍 אוסף נתונים מ-Madlan...');
      
      const response = await axios.get(this.sources.madlan.searchUrl, {
        headers: this.sources.madlan.headers,
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const properties = [];

      // Parse Madlan HTML structure
      $('.property-card').each((index, element) => {
        try {
          const property = this.parseMadlanProperty($, element);
          if (property) {
            properties.push(property);
          }
        } catch (parseError) {
          console.error('שגיאה בפרסור נכס Madlan:', parseError);
        }
      });

      const { newProperties, hotDeals } = await this.saveProperties(properties, 'madlan');
      return { newProperties, hotDeals };
    } catch (error) {
      console.error('שגיאה באיסוף מ-Madlan:', error);
      throw error;
    }
  }

  parseMadlanProperty($, element) {
    try {
      const priceText = $(element).find('.price').text();
      const price = this.extractPrice(priceText);

      const roomsText = $(element).find('.rooms').text();
      const rooms = this.extractRooms(roomsText);

      const sizeText = $(element).find('.size').text();
      const size = this.extractSize(sizeText);

      const address = $(element).find('.address').text().trim();
      const city = $(element).find('.city').text().trim();

      if (!price || !rooms || !size || !address) {
        return null;
      }

      const pricePerSquareMeter = Math.round(price / size);
      const isHotDeal = this.isHotDeal(pricePerSquareMeter, city, '');

      return {
        address: address,
        city: city,
        neighborhood: '',
        propertyType: 'apartment',
        rooms: rooms,
        size: size,
        price: price,
        pricePerSquareMeter: pricePerSquareMeter,
        condition: 'good',
        sourceWebsite: 'madlan',
        sourceUrl: $(element).find('a').attr('href') || '',
        sourceId: $(element).attr('data-id') || '',
        isHotDeal: isHotDeal,
        hotDealScore: isHotDeal ? this.calculateHotDealScore(pricePerSquareMeter, city) : 0
      };
    } catch (error) {
      console.error('שגיאה בפרסור נכס Madlan:', error);
      return null;
    }
  }

  // Helper functions
  extractPrice(priceText) {
    if (!priceText) return null;
    
    const priceMatch = priceText.match(/[\d,]+/);
    if (priceMatch) {
      return parseInt(priceMatch[0].replace(/,/g, ''));
    }
    return null;
  }

  extractRooms(roomsText) {
    if (!roomsText) return null;
    
    const roomsMatch = roomsText.match(/(\d+(?:\.\d+)?)/);
    if (roomsMatch) {
      return parseFloat(roomsMatch[1]);
    }
    return null;
  }

  extractSize(sizeText) {
    if (!sizeText) return null;
    
    const sizeMatch = sizeText.match(/(\d+)/);
    if (sizeMatch) {
      return parseInt(sizeMatch[1]);
    }
    return null;
  }

  determinePropertyType(item) {
    const typeText = (item.property_type || item.type || '').toLowerCase();
    
    if (typeText.includes('penthouse') || typeText.includes('נטהאוס')) return 'penthouse';
    if (typeText.includes('house') || typeText.includes('בית')) return 'house';
    if (typeText.includes('garden') || typeText.includes('גן')) return 'garden_apartment';
    if (typeText.includes('duplex')) return 'duplex';
    
    return 'apartment';
  }

  determineCondition(item) {
    const conditionText = (item.condition || '').toLowerCase();
    
    if (conditionText.includes('חדש') || conditionText.includes('new')) return 'new';
    if (conditionText.includes('מצוין') || conditionText.includes('excellent')) return 'excellent';
    if (conditionText.includes('טוב') || conditionText.includes('good')) return 'good';
    if (conditionText.includes('סביר') || conditionText.includes('fair')) return 'fair';
    if (conditionText.includes('שיפוץ') || conditionText.includes('renovation')) return 'needs_renovation';
    
    return 'good';
  }

  extractBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const text = value.toLowerCase();
      return text.includes('כן') || text.includes('yes') || text.includes('true');
    }
    return false;
  }

  // Hot deal detection
  isHotDeal(pricePerSquareMeter, city, neighborhood) {
    // Define average prices per square meter for different cities
    const averagePrices = {
      'תל אביב': 35000,
      'רמת גן': 32000,
      'חיפה': 25000,
      'ירושלים': 28000,
      'באר שבע': 18000
    };

    const averagePrice = averagePrices[city] || 25000;
    const discountThreshold = 0.85; // 15% below average

    return pricePerSquareMeter <= (averagePrice * discountThreshold);
  }

  calculateHotDealScore(pricePerSquareMeter, city) {
    const averagePrices = {
      'תל אביב': 35000,
      'רמת גן': 32000,
      'חיפה': 25000,
      'ירושלים': 28000,
      'באר שבע': 18000
    };

    const averagePrice = averagePrices[city] || 25000;
    const discount = ((averagePrice - pricePerSquareMeter) / averagePrice) * 100;
    
    return Math.min(100, Math.max(0, discount * 10)); // Score 0-100
  }

  // Save properties to database
  async saveProperties(properties, source) {
    let newProperties = 0;
    let hotDeals = 0;

    for (const propertyData of properties) {
      try {
        // Check if property already exists
        const existingProperty = await Property.findOne({
          sourceWebsite: source,
          sourceId: propertyData.sourceId
        });

        if (!existingProperty) {
          const property = new Property(propertyData);
          await property.save();
          newProperties++;

          if (property.isHotDeal) {
            hotDeals++;
            console.log(`🔥 עסקה חמה: ${property.address} - ₪${property.price?.toLocaleString()}`);
          }
        }
      } catch (error) {
        console.error('שגיאה בשמירת נכס:', error);
      }
    }

    return { newProperties, hotDeals };
  }
}

module.exports = new ScrapingService(); 