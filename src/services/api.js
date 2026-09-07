/**
 * Centralized API Client for Chandra Naturals Frontend
 * Connects directly to backend API configured via VITE_API_URL
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('chandra_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('chandra_token', token);
    } else {
      localStorage.removeItem('chandra_token');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('chandra_token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const currentToken = this.getToken();
    if (currentToken && !headers.Authorization) {
      headers.Authorization = `Bearer ${currentToken}`;
    }

    const config = {
      ...options,
      headers,
      credentials: 'include' // Sends & receives HttpOnly refresh cookies
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // If 401 and not an auth route, attempt token refresh once
        if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
          const refreshSuccess = await this.tryRefreshToken();
          if (refreshSuccess) {
            // Retry original request with new token
            headers.Authorization = `Bearer ${this.getToken()}`;
            const retryRes = await fetch(url, { ...config, headers });
            return await retryRes.json();
          }
        }

        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.errorCode = data.errorCode;
        error.data = data.data;
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async tryRefreshToken() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.data?.accessToken) {
        this.setToken(data.data.accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();

// Auth Endpoints
export const authAPI = {
  register: (payload) => api.post('/auth/register', payload),
  verifyOTP: (payload) => api.post('/auth/verify-otp', payload),
  resendOTP: (payload) => api.post('/auth/resend-otp', payload),
  sendEmailOTP: (payload) => api.post('/auth/send-email-otp', payload),
  verifyEmailOTP: (payload) => api.post('/auth/verify-email-otp', payload),
  login: (payload) => api.post('/auth/login', payload),
  logout: () => api.post('/auth/logout', {}),
  getMe: () => api.get('/auth/me'),
  updateProfile: (payload) => api.put('/auth/profile', payload),
  changePassword: (payload) => api.post('/auth/change-password', payload),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
  resetPassword: (payload) => api.post('/auth/reset-password', payload)
};

// Product & Category Endpoints
export const productAPI = {
  getProducts: (params = '') => api.get(`/products${params ? `?${params}` : ''}`),
  getProductById: (id) => api.get(`/products/${id}`),
  getProductBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getCategories: () => api.get('/products/categories')
};

// Cart Endpoints
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity = 1) => api.post('/cart', { productId, quantity }),
  updateQuantity: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete('/cart')
};

// Address Endpoints
export const addressAPI = {
  getAddresses: () => api.get('/addresses'),
  createAddress: (payload) => api.post('/addresses', payload),
  updateAddress: (id, payload) => api.put(`/addresses/${id}`, payload),
  deleteAddress: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.patch(`/addresses/${id}/default`, {})
};

// Order Endpoints
export const orderAPI = {
  createOrder: (payload) => api.post('/orders', payload),
  getMyOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id, reason) => api.post(`/orders/${id}/cancel`, { reason })
};

// Payment Endpoints
export const paymentAPI = {
  createRazorpayOrder: (orderId) => api.post('/payment/create-order', { orderId }),
  verifyPayment: (payload) => api.post('/payment/verify', payload)
};

// Coupon Endpoints
export const couponAPI = {
  applyCoupon: (code, subtotal) => api.post('/coupons/apply', { code, subtotal }),
  getActiveCoupons: () => api.get('/coupons')
};

// Review Endpoints
export const reviewAPI = {
  getProductReviews: (productId) => api.get(`/products/${productId}/reviews`),
  createReview: (productId, payload) => api.post(`/products/${productId}/reviews`, payload),
  deleteReview: (productId, reviewId) => api.delete(`/products/${productId}/reviews/${reviewId}`)
};

// Admin Operations & Kitchen Dispatch Endpoints
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getOrders: (params = '') => api.get(`/admin/orders${params ? `?${params}` : ''}`),
  getOrderById: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, payload) => api.put(`/admin/orders/${id}/status`, payload),
  updateStock: (id, payload) => api.patch(`/admin/products/${id}/stock`, payload),
  updateProduct: (id, payload) => api.put(`/admin/products/${id}`, payload),
  createProduct: (payload) => api.post('/admin/products', payload),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`)
};

export default api;

