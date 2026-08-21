import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:8080');
const cleanHost = rawBaseUrl ? rawBaseUrl.replace(/\/+$/, '').replace(/\/api$/, '').replace(/\/admin$/, '') : '';
const BASE_URL = cleanHost ? `${cleanHost}/api` : '/api';

export const adminApi = axios.create({
  baseURL: `${BASE_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('alzain_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('alzain_admin_token');
      localStorage.removeItem('alzain_admin_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const adminLogin = async (emailOrUsername, password) => {
  const isEmail = emailOrUsername.includes('@');
  const payload = isEmail
    ? { email: emailOrUsername, password }
    : { username: emailOrUsername, password };

  const response = await axios.post(`${BASE_URL}/auth/admin/login`, payload);
  if (response.data && response.data.token) {
    localStorage.setItem('alzain_admin_token', response.data.token);
    localStorage.setItem(
      'alzain_admin_user',
      JSON.stringify({
        username: response.data.username,
        email: response.data.email,
        role: response.data.role,
      })
    );
  }
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axios.post(`${BASE_URL}/auth/admin/forgot-password`, { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await axios.post(`${BASE_URL}/auth/admin/reset-password`, {
    token,
    newPassword,
  });
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await adminApi.put('/change-password', { currentPassword, newPassword });
  return response.data;
};

// Dashboard Endpoints
export const fetchDashboardMetrics = async () => {
  const response = await adminApi.get('/dashboard');
  return response.data;
};

export const fetchRecentBookings = async () => {
  const response = await adminApi.get('/bookings/recent');
  return response.data;
};

// Package Catalogue Endpoints
export const fetchPackages = async () => {
  const response = await adminApi.get('/packages');
  return response.data;
};

export const fetchPackageById = async (id) => {
  const response = await adminApi.get(`/packages/${id}`);
  return response.data;
};

export const createPackage = async (packageData) => {
  const response = await adminApi.post('/packages', packageData);
  return response.data;
};

export const updatePackage = async (id, packageData) => {
  const response = await adminApi.put(`/packages/${id}`, packageData);
  return response.data;
};

export const togglePackageStatus = async (id) => {
  const response = await adminApi.patch(`/packages/${id}/toggle-status`);
  return response.data;
};

export const deletePackage = async (id) => {
  const response = await adminApi.delete(`/packages/${id}`);
  return response.data;
};

// Test Master Endpoints
export const fetchTests = async () => {
  const response = await adminApi.get('/tests');
  return response.data;
};

export const createTest = async (testData) => {
  const response = await adminApi.post('/tests', testData);
  return response.data;
};

export const updateTest = async (id, testData) => {
  const response = await adminApi.put(`/tests/${id}`, testData);
  return response.data;
};

export const deleteTest = async (id) => {
  const response = await adminApi.delete(`/tests/${id}`);
  return response.data;
};

// Booking Management Endpoints
export const fetchBookings = async (statusFilter = 'ALL') => {
  const params = statusFilter !== 'ALL' ? { status: statusFilter } : {};
  const response = await adminApi.get('/bookings', { params });
  return response.data;
};

export const fetchBookingById = async (id) => {
  const response = await adminApi.get(`/bookings/${id}`);
  return response.data;
};

export const updateBookingStatus = async (id, newStatus) => {
  const response = await adminApi.put(`/bookings/${id}/status`, { status: newStatus });
  return response.data;
};

export const retryNotification = async (notificationId) => {
  const response = await adminApi.post(`/bookings/notifications/${notificationId}/retry`);
  return response.data;
};

export const deleteBooking = async (id) => {
  const response = await adminApi.delete(`/bookings/${id}`);
  return response.data;
};

// Review Management Endpoints
export const fetchAdminReviews = async () => {
  const response = await adminApi.get('/reviews');
  return response.data;
};

export const updateReviewStatus = async (id, newStatus) => {
  const response = await adminApi.put(`/reviews/${id}/status`, { status: newStatus });
  return response.data;
};

export const deleteAdminReview = async (id) => {
  const response = await adminApi.delete(`/reviews/${id}`);
  return response.data;
};
