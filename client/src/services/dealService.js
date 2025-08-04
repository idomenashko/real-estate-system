import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

export const dealService = {
  // Create new deal
  async createDeal(dealData) {
    const response = await api.post('/deals', dealData);
    return response.data;
  },

  // Get user's deals
  async getMyDeals(filters = {}) {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const response = await api.get(`/deals/my-deals?${params.toString()}`);
    return response.data;
  },

  // Get deal by ID
  async getDeal(dealId) {
    const response = await api.get(`/deals/${dealId}`);
    return response.data.deal;
  },

  // Update deal status
  async updateDealStatus(dealId, status) {
    const response = await api.put(`/deals/${dealId}/status`, { status });
    return response.data;
  },

  // Add note to deal
  async addDealNote(dealId, content) {
    const response = await api.post(`/deals/${dealId}/notes`, { content });
    return response.data;
  },

  // Update deal details
  async updateDeal(dealId, dealData) {
    const response = await api.put(`/deals/${dealId}`, dealData);
    return response.data;
  },

  // Get all deals (admin only)
  async getAllDeals(filters = {}) {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const response = await api.get(`/deals?${params.toString()}`);
    return response.data;
  },

  // Get deal statistics
  async getDealStats() {
    const response = await api.get('/deals/stats/overview');
    return response.data;
  },
}; 