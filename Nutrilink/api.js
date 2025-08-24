import axios from 'axios';

const API_URL = 'http://localhost:5002/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Adding auth token to request:', config.url); // Debug log
  } else {
    console.log('No auth token found for request:', config.url); // Debug log
  }
  return config;
}, (error) => {
  console.error('Request interceptor error:', error); // Debug log
  return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Unauthorized error - clearing auth data'); // Debug log
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Settings API
export const settings = {
  update: (data) => api.put('/auth/profile', data),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Contact API
export const contact = {
  submit: (data) => api.post('/contact/submit', data)
};

// Donations API
export const donations = {
  getAll: () => api.get('/donations'),
  getById: (id) => api.get(`/donations/${id}`),
  getByDonor: () => api.get('/donations/donor/me'),
  create: (data) => api.post('/donations', data),
  update: (id, data) => api.patch(`/donations/${id}`, data),
  delete: (id) => api.delete(`/donations/${id}`),
};

// Requests API
export const requests = {
  getAll: () => api.get('/requests'),
  getMyRequests: () => api.get('/requests/my-requests'),
  getByDonationId: (donationId) => api.get(`/requests/donation/${donationId}`),
  getById: (id) => api.get(`/requests/${id}`),
  create: (data) => {
    console.log('API Service - Creating request with data:', data);
    return api.post('/requests', data);
  },
  update: (id, data) => api.patch(`/requests/${id}`, data),
  delete: (id) => api.delete(`/requests/${id}`),
  updateStatus: (id, action) => api.put(`/requests/${id}/${action}`),
  collect: (id) => api.put(`/requests/${id}/collect`),
  getRequestHistory: (userId) => api.get(`/requests/history/${userId}`)
};

// Newsletter API
export const newsletter = {
  subscribe: (email) => api.post('/newsletter/subscribe', { email }),
};

// Review API
export const reviews = {
  getAll: () => api.get('/reviews'),
  getMyReviews: () => api.get('/reviews/my-reviews'),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.patch(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export default api; 