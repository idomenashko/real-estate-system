const puppeteer = require('puppeteer');
const Property = require('../models/Property');

class ScrapingService {
  constructor() {
    this.browser = null;
    this.isRunning = false;
  }

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Scrape Yad2 properties
  async scrapeYad2(filters = {}) {
    const properties = [];
    const page = await this.browser.newPage();
    
    try {
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Build search URL based on filters
      let searchUrl = 'https://www.yad2.co.il/realestate/forsale';
      const params = new URLSearchParams();
      
      if (filters.city) params.append('city', filters.city);
      if (filters.minPrice) params.append('price', filters.minPrice);
      if (filters.maxPrice) params.append('price', filters.maxPrice);
      if (filters.minRooms) params.append('rooms', filters.minRooms);
      
      if (params.toString()) {
        searchUrl += '?' + params.toString();
      }

      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      
      // Wait for properties to load
      await page.waitForSelector('.feeditem', { timeout: 10000 });
      
      // Extract property data
      const propertyElements = await page.$$('.feeditem');
      
      for (const element of propertyElements.slice(0, 20)) { // Limit to 20 properties
        try {
          const propertyData = await this.extractYad2PropertyData(element);
          if (propertyData) {
            properties.push(propertyData);
          }
        } catch (error) {
          console.error('Error extracting Yad2 property:', error);
        }
      }
      
    } catch (error) {
      console.error('Error scraping Yad2:', error);
    } finally {
      await page.close();
    }
    
    return properties;
  }

  // Extract property data from Yad2 element
  async extractYad2PropertyData(element) {
    try {
      const title = await element.$eval('.title', el => el.textContent.trim());
      const price = await element.$eval('.price', el => {
        const priceText = el.textContent.trim();
        return parseInt(priceText.replace(/[^\d]/g, ''));
      });
      const address = await element.$eval('.address', el => el.textContent.trim());
      const rooms = await element.$eval('.rooms', el => {
        const roomsText = el.textContent.trim();
        return parseFloat(roomsText.replace(/[^\d.]/g, ''));
      });
      const size = await element.$eval('.size', el => {
        const sizeText = el.textContent.trim();
        return parseInt(sizeText.replace(/[^\d]/g, ''));
      });
      const link = await element.$eval('a', el => el.href);
      
      // Parse address to extract city and neighborhood
      const addressParts = address.split(',');
      const city = addressParts[addressParts.length - 1]?.trim() || '';
      const neighborhood = addressParts[addressParts.length - 2]?.trim() || '';
      
      return {
        address,
        city,
        neighborhood,
        street: addressParts[0]?.trim() || '',
        propertyType: this.determinePropertyType(title),
        rooms,
        size,
        price,
        sourceWebsite: 'yad2',
        sourceUrl: link,
        sourceId: this.extractSourceId(link),
        isHotDeal: this.calculateHotDealScore(price, size, rooms) > 80,
        hotDealScore: this.calculateHotDealScore(price, size, rooms),
        status: 'active'
      };
    } catch (error) {
      console.error('Error extracting Yad2 property data:', error);
      return null;
    }
  }

  // Scrape WinWin properties
  async scrapeWinWin(filters = {}) {
    const properties = [];
    const page = await this.browser.newPage();
    
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      let searchUrl = 'https://www.winwin.co.il/realestate/forsale';
      const params = new URLSearchParams();
      
      if (filters.city) params.append('city', filters.city);
      if (filters.minPrice) params.append('price', filters.minPrice);
      if (filters.maxPrice) params.append('price', filters.maxPrice);
      
      if (params.toString()) {
        searchUrl += '?' + params.toString();
      }

      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      await page.waitForSelector('.property-item', { timeout: 10000 });
      
      const propertyElements = await page.$$('.property-item');
      
      for (const element of propertyElements.slice(0, 20)) {
        try {
          const propertyData = await this.extractWinWinPropertyData(element);
          if (propertyData) {
            properties.push(propertyData);
          }
        } catch (error) {
          console.error('Error extracting WinWin property:', error);
        }
      }
      
    } catch (error) {
      console.error('Error scraping WinWin:', error);
    } finally {
      await page.close();
    }
    
    return properties;
  }

  // Extract property data from WinWin element
  async extractWinWinPropertyData(element) {
    try {
      const title = await element.$eval('.title', el => el.textContent.trim());
      const price = await element.$eval('.price', el => {
        const priceText = el.textContent.trim();
        return parseInt(priceText.replace(/[^\d]/g, ''));
      });
      const address = await element.$eval('.address', el => el.textContent.trim());
      const rooms = await element.$eval('.rooms', el => {
        const roomsText = el.textContent.trim();
        return parseFloat(roomsText.replace(/[^\d.]/g, ''));
      });
      const size = await element.$eval('.size', el => {
        const sizeText = el.textContent.trim();
        return parseInt(sizeText.replace(/[^\d]/g, ''));
      });
      const link = await element.$eval('a', el => el.href);
      
      const addressParts = address.split(',');
      const city = addressParts[addressParts.length - 1]?.trim() || '';
      const neighborhood = addressParts[addressParts.length - 2]?.trim() || '';
      
      return {
        address,
        city,
        neighborhood,
        street: addressParts[0]?.trim() || '',
        propertyType: this.determinePropertyType(title),
        rooms,
        size,
        price,
        sourceWebsite: 'winwin',
        sourceUrl: link,
        sourceId: this.extractSourceId(link),
        isHotDeal: this.calculateHotDealScore(price, size, rooms) > 80,
        hotDealScore: this.calculateHotDealScore(price, size, rooms),
        status: 'active'
      };
    } catch (error) {
      console.error('Error extracting WinWin property data:', error);
      return null;
    }
  }

  // Scrape Madlan properties
  async scrapeMadlan(filters = {}) {
    const properties = [];
    const page = await this.browser.newPage();
    
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      let searchUrl = 'https://www.madlan.co.il/realestate/forsale';
      const params = new URLSearchParams();
      
      if (filters.city) params.append('city', filters.city);
      if (filters.minPrice) params.append('price', filters.minPrice);
      if (filters.maxPrice) params.append('price', filters.maxPrice);
      
      if (params.toString()) {
        searchUrl += '?' + params.toString();
      }

      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      await page.waitForSelector('.property-card', { timeout: 10000 });
      
      const propertyElements = await page.$$('.property-card');
      
      for (const element of propertyElements.slice(0, 20)) {
        try {
          const propertyData = await this.extractMadlanPropertyData(element);
          if (propertyData) {
            properties.push(propertyData);
          }
        } catch (error) {
          console.error('Error extracting Madlan property:', error);
        }
      }
      
    } catch (error) {
      console.error('Error scraping Madlan:', error);
    } finally {
      await page.close();
    }
    
    return properties;
  }

  // Extract property data from Madlan element
  async extractMadlanPropertyData(element) {
    try {
      const title = await element.$eval('.title', el => el.textContent.trim());
      const price = await element.$eval('.price', el => {
        const priceText = el.textContent.trim();
        return parseInt(priceText.replace(/[^\d]/g, ''));
      });
      const address = await element.$eval('.address', el => el.textContent.trim());
      const rooms = await element.$eval('.rooms', el => {
        const roomsText = el.textContent.trim();
        return parseFloat(roomsText.replace(/[^\d.]/g, ''));
      });
      const size = await element.$eval('.size', el => {
        const sizeText = el.textContent.trim();
        return parseInt(sizeText.replace(/[^\d]/g, ''));
      });
      const link = await element.$eval('a', el => el.href);
      
      const addressParts = address.split(',');
      const city = addressParts[addressParts.length - 1]?.trim() || '';
      const neighborhood = addressParts[addressParts.length - 2]?.trim() || '';
      
      return {
        address,
        city,
        neighborhood,
        street: addressParts[0]?.trim() || '',
        propertyType: this.determinePropertyType(title),
        rooms,
        size,
        price,
        sourceWebsite: 'madlan',
        sourceUrl: link,
        sourceId: this.extractSourceId(link),
        isHotDeal: this.calculateHotDealScore(price, size, rooms) > 80,
        hotDealScore: this.calculateHotDealScore(price, size, rooms),
        status: 'active'
      };
    } catch (error) {
      console.error('Error extracting Madlan property data:', error);
      return null;
    }
  }

  // Main scraping method
  async scrapeAllWebsites(filters = {}) {
    if (this.isRunning) {
      console.log('Scraping already in progress...');
      return [];
    }

    this.isRunning = true;
    const allProperties = [];

    try {
      await this.initialize();
      
      console.log('🔍 מתחיל סקרייפינג נכסים...');
      
      // Scrape from all websites
      const [yad2Properties, winwinProperties, madlanProperties] = await Promise.allSettled([
        this.scrapeYad2(filters),
        this.scrapeWinWin(filters),
        this.scrapeMadlan(filters)
      ]);

      // Combine all properties
      if (yad2Properties.status === 'fulfilled') {
        allProperties.push(...yad2Properties.value);
        console.log(`✅ Yad2: ${yad2Properties.value.length} נכסים`);
      }
      
      if (winwinProperties.status === 'fulfilled') {
        allProperties.push(...winwinProperties.value);
        console.log(`✅ WinWin: ${winwinProperties.value.length} נכסים`);
      }
      
      if (madlanProperties.status === 'fulfilled') {
        allProperties.push(...madlanProperties.value);
        console.log(`✅ Madlan: ${madlanProperties.value.length} נכסים`);
      }

      // Remove duplicates based on sourceUrl
      const uniqueProperties = this.removeDuplicates(allProperties);
      
      // Save to database
      const savedProperties = await this.savePropertiesToDatabase(uniqueProperties);
      
      console.log(`✅ סך הכל נשמרו ${savedProperties.length} נכסים חדשים`);
      
      return savedProperties;
      
    } catch (error) {
      console.error('❌ שגיאה בסקרייפינג:', error);
      return [];
    } finally {
      this.isRunning = false;
      await this.close();
    }
  }

  // Remove duplicate properties
  removeDuplicates(properties) {
    const seen = new Set();
    return properties.filter(property => {
      const key = property.sourceUrl;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Save properties to database
  async savePropertiesToDatabase(properties) {
    const savedProperties = [];
    
    for (const property of properties) {
      try {
        // Check if property already exists
        const existingProperty = await Property.findOne({ sourceUrl: property.sourceUrl });
        
        if (!existingProperty) {
          const newProperty = new Property(property);
          await newProperty.save();
          savedProperties.push(newProperty);
        }
      } catch (error) {
        console.error('Error saving property:', error);
      }
    }
    
    return savedProperties;
  }

  // Helper methods
  determinePropertyType(title) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('נטהאוס') || titleLower.includes('penthouse')) return 'penthouse';
    if (titleLower.includes('בית') || titleLower.includes('house')) return 'house';
    if (titleLower.includes('דירת גן') || titleLower.includes('garden')) return 'garden_apartment';
    if (titleLower.includes('דופלקס') || titleLower.includes('duplex')) return 'duplex';
    return 'apartment';
  }

  extractSourceId(url) {
    const match = url.match(/\/(\d+)/);
    return match ? match[1] : null;
  }

  calculateHotDealScore(price, size, rooms) {
    // Simple scoring algorithm
    const pricePerSqm = price / size;
    const avgPricePerSqm = 15000; // Average price per sqm in Israel
    
    let score = 100;
    
    // Price factor (lower price = higher score)
    if (pricePerSqm < avgPricePerSqm * 0.8) score += 20;
    else if (pricePerSqm > avgPricePerSqm * 1.2) score -= 20;
    
    // Size factor (larger size = higher score)
    if (size > 100) score += 10;
    else if (size < 60) score -= 10;
    
    // Rooms factor (more rooms = higher score)
    if (rooms >= 4) score += 10;
    else if (rooms <= 2) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  // Start continuous scraping
  async startContinuousScraping(intervalMinutes = 60) {
    console.log(`🔄 מתחיל סקרייפינג רציף כל ${intervalMinutes} דקות`);
    
    const runScraping = async () => {
      try {
        await this.scrapeAllWebsites();
        console.log(`✅ סקרייפינג הושלם, הבא בעוד ${intervalMinutes} דקות`);
      } catch (error) {
        console.error('❌ שגיאה בסקרייפינג רציף:', error);
      }
    };

    // Run immediately
    await runScraping();
    
    // Set interval for continuous scraping
    setInterval(runScraping, intervalMinutes * 60 * 1000);
  }
}

module.exports = new ScrapingService(); 