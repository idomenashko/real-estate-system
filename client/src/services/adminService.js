import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminService = {
  // Trigger manual scraping
  async triggerManualScraping() {
    const response = await api.post('/admin/scrape');
    return response.data;
  },

  // Start continuous scraping
  async startContinuousScraping() {
    const response = await api.post('/admin/scrape/start');
    return response.data;
  },

  // Get scraping status
  async getScrapingStatus() {
    const response = await api.get('/admin/scrape/status');
    return response.data;
  },

  // Get properties by source
  async getPropertiesBySource() {
    const response = await api.get('/admin/properties/by-source');
    return response.data;
  },

  // Delete properties by source
  async deletePropertiesBySource(source) {
    const response = await api.delete('/admin/properties/by-source', {
      data: { source }
    });
    return response.data;
  },

  // Update property hot deal status
  async updatePropertyHotDealStatus(propertyId, isHotDeal) {
    const response = await api.put(`/admin/properties/${propertyId}/hot-deal`, {
      isHotDeal
    });
    return response.data;
  }
}; 