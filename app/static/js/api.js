/* PricePilot AI — REST API Client & JWT Auth Manager */
const API = {
  baseUrl: '/api',

  getToken() {
    return localStorage.getItem('access_token');
  },

  setTokens(access, refresh, user) {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
  },

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getUser() {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  },

  async request(endpoint, method = 'GET', data = null) {
    const headers = {
      'Content-Type': 'application/json'
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || `HTTP error! status: ${response.status}`);
      }

      return resData;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  },

  // Auth endpoints
  async login(email, password) {
    const res = await this.request('/auth/login', 'POST', { email, password });
    if (res.access_token) {
      this.setTokens(res.access_token, res.refresh_token, res.user);
    }
    return res;
  },

  async register(name, email, password, role) {
    const res = await this.request('/auth/register', 'POST', { name, email, password, role });
    if (res.access_token) {
      this.setTokens(res.access_token, res.refresh_token, res.user);
    }
    return res;
  },

  async logout() {
    try {
      await this.request('/auth/logout', 'POST');
    } catch (e) {}
    this.clearTokens();
  },

  // Pricing endpoints
  async predictPrice(featureData) {
    return await this.request('/pricing/predict-price', 'POST', featureData);
  },

  async forecastDemand(productId, days) {
    return await this.request('/pricing/forecast-demand', 'POST', { product_id: productId, days });
  },

  async optimizePrice(currentPrice, cost) {
    return await this.request('/pricing/optimize-price', 'POST', { current_price: currentPrice, cost });
  },

  // Dashboard endpoints
  async getSummary() {
    return await this.request('/dashboard/summary');
  },

  async getMonthlyRevenue() {
    return await this.request('/dashboard/monthly-revenue');
  },

  async getWeeklyRevenue() {
    return await this.request('/dashboard/weekly-revenue');
  },

  async getTopProducts() {
    return await this.request('/dashboard/top-products');
  },

  async getTopSellers() {
    return await this.request('/dashboard/top-sellers');
  },

  async getCustomerInsights() {
    return await this.request('/dashboard/customer-insights');
  },

  // Analytics
  async getFeatureImportance() {
    return await this.request('/analytics/feature-importance');
  },

  async getModelPerformance() {
    return await this.request('/analytics/model-performance');
  },

  // Products CRUD
  async getProducts(page = 1, search = '') {
    return await this.request(`/products?page=${page}&search=${encodeURIComponent(search)}`);
  },

  async createProduct(productData) {
    return await this.request('/products', 'POST', productData);
  },

  async updateProduct(id, productData) {
    return await this.request(`/products/${id}`, 'PUT', productData);
  },

  async deleteProduct(id) {
    return await this.request(`/products/${id}`, 'DELETE');
  }
};
