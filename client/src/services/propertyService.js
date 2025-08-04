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

export const propertyService = {
  // Get all properties with filters
  async getProperties(filters = {}) {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const response = await api.get(`/properties?${params.toString()}`);
    return response.data;
  },

  // Get property by ID
  async getProperty(propertyId) {
    const response = await api.get(`/properties/${propertyId}`);
    return response.data.property;
  },

  // Get hot deals
  async getHotDeals(limit = 10) {
    const response = await api.get(`/properties/hot-deals?limit=${limit}`);
    return response.data.hotDeals;
  },

  // Get properties by city
  async getPropertiesByCity(city, page = 1, limit = 20) {
    const response = await api.get(`/properties/city/${city}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Search properties
  async searchProperties(query, page = 1, limit = 20) {
    const response = await api.get(`/properties/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get property analysis
  async getPropertyAnalysis(propertyId) {
    const response = await api.get(`/properties/${propertyId}/analysis`);
    return response.data;
  },

  // Get property statistics
  async getPropertyStats() {
    const response = await api.get('/properties/stats/overview');
    return response.data;
  },
}; 