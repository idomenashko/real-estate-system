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

export const propertyService = {
  // Get all properties with filters
  async getProperties(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/properties?${params.toString()}`);
    return response.data;
  },

  // Get property by ID
  async getPropertyById(propertyId) {
    const response = await api.get(`/properties/${propertyId}`);
    return response.data.property;
  },

  // Get hot deals
  async getHotDeals(limit = 10) {
    const response = await api.get(`/properties/hot-deals?limit=${limit}`);
    return response.data.hotDeals;
  },

  // Get personalized hot deals based on user preferences
  async getPersonalizedHotDeals(limit = 10) {
    const response = await api.get(`/properties/hot-deals/personalized?limit=${limit}`);
    return response.data;
  },

  // Get personalized properties based on user preferences
  async getPersonalizedProperties(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/properties/personalized?${params.toString()}`);
    return response.data;
  },

  // Search properties
  async searchProperties(query, page = 1, limit = 20) {
    const response = await api.get(`/properties/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get properties by city
  async getPropertiesByCity(city, page = 1, limit = 20) {
    const response = await api.get(`/properties/city/${encodeURIComponent(city)}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get property statistics
  async getPropertyStats() {
    const response = await api.get('/properties/stats/overview');
    return response.data;
  },

  // Get property analysis
  async getPropertyAnalysis(propertyId) {
    const response = await api.get(`/properties/${propertyId}/analysis`);
    return response.data;
  },

  // Create new property (admin only)
  async createProperty(propertyData) {
    const response = await api.post('/properties', propertyData);
    return response.data;
  },

  // Update property (admin only)
  async updateProperty(propertyId, propertyData) {
    const response = await api.put(`/properties/${propertyId}`, propertyData);
    return response.data;
  },

  // Delete property (admin only)
  async deleteProperty(propertyId) {
    const response = await api.delete(`/properties/${propertyId}`);
    return response.data;
  },

  // Get market trends
  async getMarketTrends() {
    const response = await api.get('/properties/market-trends');
    return response.data;
  },

  // Get similar properties
  async getSimilarProperties(propertyId, limit = 5) {
    const response = await api.get(`/properties/${propertyId}/similar?limit=${limit}`);
    return response.data;
  }
}; 