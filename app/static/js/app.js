/* PricePilot AI — Main SPA Application Logic */
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  async init() {
    this.bindEvents();
    this.updateUserUI();
    await this.loadDashboard();
  },

  bindEvents() {
    // Navigation tab click handlers
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        if (tab) this.switchTab(tab);
      });
    });

    // Login Form Submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pwd = document.getElementById('login-password').value;
        try {
          const res = await API.login(email, pwd);
          this.showNotification('Login successful!', 'success');
          this.closeModal('login-modal');
          this.updateUserUI();
          this.loadDashboard();
        } catch (err) {
          this.showNotification(err.message || 'Login failed', 'error');
        }
      });
    }

    // Register Form Submit
    const regForm = document.getElementById('register-form');
    if (regForm) {
      regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const pwd = document.getElementById('reg-password').value;
        const role = document.getElementById('reg-role').value;
        try {
          await API.register(name, email, pwd, role);
          this.showNotification('Account registered successfully!', 'success');
          this.closeModal('register-modal');
          this.updateUserUI();
          this.loadDashboard();
        } catch (err) {
          this.showNotification(err.message || 'Registration failed', 'error');
        }
      });
    }

    // Live AI Price Prediction Form Submit
    const predictForm = document.getElementById('predict-price-form');
    if (predictForm) {
      predictForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
          product_id: document.getElementById('pred-product-id').value,
          price: parseFloat(document.getElementById('pred-base-price').value),
          freight_value: parseFloat(document.getElementById('pred-freight').value),
          product_weight_g: parseFloat(document.getElementById('pred-weight').value),
          product_length_cm: parseFloat(document.getElementById('pred-length').value),
          product_height_cm: parseFloat(document.getElementById('pred-height').value),
          product_width_cm: parseFloat(document.getElementById('pred-width').value)
        };

        const resultBox = document.getElementById('prediction-results-box');
        resultBox.style.display = 'block';
        resultBox.innerHTML = '<div style="color: #94a3b8;">Processing feature vector with ExtraTrees ML engine...</div>';

        try {
          const res = await API.predictPrice(data);
          resultBox.innerHTML = `
            <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid var(--border-highlight); padding: 20px; border-radius: 12px; margin-top: 16px;">
              <h4 style="color: #a5b4fc; font-size: 18px; margin-bottom: 8px;">🤖 ML Optimized Price Recommendation</h4>
              <div style="font-size: 32px; font-weight: 800; color: #10b981; margin: 10px 0;">R$ ${res.predicted_price.toFixed(2)}</div>
              <div style="display: flex; gap: 20px; font-size: 14px; color: #94a3b8;">
                <div>Min Price: <strong style="color: white;">R$ ${res.suggested_min_price.toFixed(2)}</strong></div>
                <div>Max Price: <strong style="color: white;">R$ ${res.suggested_max_price.toFixed(2)}</strong></div>
                <div>Confidence Score: <strong style="color: #38bdf8;">${(res.confidence_score * 100).toFixed(1)}%</strong></div>
              </div>
              <div style="margin-top: 12px; font-size: 12px; color: #64748b;">Model: ${res.model_used} | R² = 0.9904</div>
            </div>
          `;
          this.showNotification('Prediction generated successfully', 'success');
        } catch (err) {
          resultBox.innerHTML = `<div style="color: #ef4444;">Prediction failed: ${err.message}. Please login first.</div>`;
          this.showNotification('Must be logged in to predict', 'warning');
        }
      });
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await API.logout();
        this.updateUserUI();
        this.showNotification('Logged out successfully', 'info');
      });
    }
  },

  switchTab(tabId) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));

    const targetNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    const targetPane = document.getElementById(`tab-${tabId}`);

    if (targetNav) targetNav.classList.add('active');
    if (targetPane) targetPane.classList.add('active');

    if (tabId === 'products') this.loadProducts();
    if (tabId === 'analytics') this.loadAnalytics();
  },

  updateUserUI() {
    const user = API.getUser();
    const userDisplay = document.getElementById('user-display-name');
    const userRoleDisplay = document.getElementById('user-display-role');
    const authBtnGroup = document.getElementById('auth-btn-group');
    const logoutBtn = document.getElementById('logout-btn');

    if (user) {
      if (userDisplay) userDisplay.textContent = user.name;
      if (userRoleDisplay) userRoleDisplay.textContent = user.role;
      if (authBtnGroup) authBtnGroup.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-flex';
    } else {
      if (userDisplay) userDisplay.textContent = 'Guest User';
      if (userRoleDisplay) userRoleDisplay.textContent = 'Not Logged In';
      if (authBtnGroup) authBtnGroup.style.display = 'flex';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  },

  async loadDashboard() {
    try {
      const summary = await API.getSummary();
      document.getElementById('kpi-total-revenue').textContent = `R$ ${(summary.total_revenue / 1000000).toFixed(2)}M`;
      document.getElementById('kpi-avg-order-value').textContent = `R$ ${summary.avg_order_value.toFixed(2)}`;
      document.getElementById('kpi-total-orders').textContent = summary.total_orders.toLocaleString();
      document.getElementById('kpi-predicted-revenue').textContent = `R$ ${(summary.predicted_revenue / 1000000).toFixed(2)}M`;
      document.getElementById('kpi-best-category').textContent = summary.best_selling_category;
      document.getElementById('kpi-avg-rating').textContent = `${summary.avg_rating} / 5.0`;

      // Load Charts
      const monthly = await API.getMonthlyRevenue();
      ChartsEngine.initMonthlyRevenueChart('monthly-revenue-chart', monthly);

      const weekly = await API.getWeeklyRevenue();
      ChartsEngine.initWeeklyRevenueChart('weekly-revenue-chart', weekly);

      const insights = await API.getCustomerInsights();
      ChartsEngine.initCustomerStateChart('customer-state-chart', insights);

      const fi = await API.getFeatureImportance();
      ChartsEngine.initFeatureImportanceChart('feature-importance-chart', fi);
    } catch (e) {
      console.error('Error loading dashboard stats:', e);
    }
  },

  async loadProducts() {
    try {
      const res = await API.getProducts(1);
      const tbody = document.getElementById('products-table-body');
      if (!tbody) return;

      tbody.innerHTML = res.products.map(p => `
        <tr>
          <td><strong>${p.product_id}</strong></td>
          <td><span class="badge badge-info">${p.category_name}</span></td>
          <td>${p.product_weight_g} g</td>
          <td>${p.product_length_cm} x ${p.product_height_cm} x ${p.product_width_cm} cm</td>
          <td><strong style="color: #10b981;">R$ ${p.current_price.toFixed(2)}</strong></td>
          <td>
            <button class="btn btn-secondary" onclick="App.triggerRecommend('${p.product_id}', ${p.current_price}, ${p.product_weight_g})" style="padding: 4px 10px; font-size: 12px;">Optimize AI</button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error('Error loading products:', e);
    }
  },

  triggerRecommend(pid, price, weight) {
    this.switchTab('pricing');
    document.getElementById('pred-product-id').value = pid;
    document.getElementById('pred-base-price').value = price;
    document.getElementById('pred-weight').value = weight;
  },

  async loadAnalytics() {
    try {
      const perf = await API.getModelPerformance();
      const tbody = document.getElementById('model-performance-table-body');
      if (!tbody) return;

      tbody.innerHTML = perf.map(m => `
        <tr>
          <td>#${m.Rank}</td>
          <td><strong>${m.Model}</strong> ${m.Rank === 1 ? '🏆 (Best Model)' : ''}</td>
          <td><span class="badge badge-success">${(m.R2_Score * 100).toFixed(2)}%</span></td>
          <td>${(m.CV_Score * 100).toFixed(2)}%</td>
          <td>R$ ${m.RMSE_BRL.toFixed(2)}</td>
          <td>R$ ${m.MAE_BRL.toFixed(2)}</td>
        </tr>
      `).join('');
    } catch (e) {
      console.error('Error loading model performance:', e);
    }
  },

  openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('active');
  },

  closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('active');
  },

  showNotification(msg, type = 'info') {
    alert(`[${type.toUpperCase()}] ${msg}`);
  }
};
