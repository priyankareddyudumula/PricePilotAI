/* PricePilot AI — Luxury SPA Application Controller */
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
    // Navigation tab switching
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        if (tab) this.switchTab(tab);
      });
    });

    // Keyboard shortcut for search (⌘K / Ctrl+K)
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.openModal('search-modal');
      }
    });

    // Login submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pwd = document.getElementById('login-password').value;
        try {
          const res = await API.login(email, pwd);
          this.showNotification('Signed in successfully', 'success');
          this.closeModal('login-modal');
          this.updateUserUI();
          this.loadDashboard();
        } catch (err) {
          this.showNotification(err.message || 'Login failed', 'error');
        }
      });
    }

    // Register submit
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
          this.showNotification('Account registered successfully', 'success');
          this.closeModal('register-modal');
          this.updateUserUI();
          this.loadDashboard();
        } catch (err) {
          this.showNotification(err.message || 'Registration failed', 'error');
        }
      });
    }

    // Live ML Price Form Submit
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
        resultBox.innerHTML = '<div style="color: var(--text-muted); font-size: 13px;">Computing Extra Trees ML inference...</div>';

        try {
          const res = await API.predictPrice(data);
          resultBox.innerHTML = `
            <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid var(--border-glow); padding: 22px; border-radius: var(--radius-card);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #a5b4fc; letter-spacing: 0.04em;">🤖 ML Recommended Optimal Price</div>
                  <div style="font-size: 32px; font-weight: 800; color: #10b981; margin: 4px 0 12px 0;">R$ ${res.predicted_price.toFixed(2)}</div>
                </div>
                <span class="badge-rank gold" style="padding: 6px 12px; font-size: 12px;">Confidence ${(res.confidence_score * 100).toFixed(1)}%</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; border-top: 1px solid var(--border-subtle); pt: 12px; margin-top: 12px; font-size: 13px;">
                <div><span style="color: var(--text-muted);">Suggested Min:</span> <strong style="color: var(--text-heading);">R$ ${res.suggested_min_price.toFixed(2)}</strong></div>
                <div><span style="color: var(--text-muted);">Suggested Max:</span> <strong style="color: var(--text-heading);">R$ ${res.suggested_max_price.toFixed(2)}</strong></div>
                <div><span style="color: var(--text-muted);">Model:</span> <strong style="color: #38bdf8;">${res.model_used}</strong></div>
              </div>
            </div>
          `;
          this.showNotification('Prediction generated successfully', 'success');
        } catch (err) {
          resultBox.innerHTML = `<div style="color: var(--danger-red); font-size: 13px;">Prediction failed: ${err.message}. Please sign in.</div>`;
          this.showNotification('Must be signed in to predict', 'warning');
        }
      });
    }

    // Logout
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
    const bcCurrent = document.getElementById('breadcrumb-current-page');

    if (targetNav) targetNav.classList.add('active');
    if (targetPane) targetPane.classList.add('active');
    if (bcCurrent && targetNav) bcCurrent.textContent = targetNav.textContent.trim().replace(/^[\s\S]*?\s/, '');

    if (tabId === 'products') this.loadProducts();
    if (tabId === 'analytics') this.loadAnalytics();
    if (tabId === 'forecasting') ChartsEngine.initDemandForecastChart('demand-forecast-chart');
  },

  updateUserUI() {
    const user = API.getUser();
    const userDisplay = document.getElementById('user-display-name');
    const userRoleDisplay = document.getElementById('user-display-role');
    const authBtnGroup = document.getElementById('auth-btn-group');
    const logoutBtn = document.getElementById('logout-btn');
    const avatarInit = document.getElementById('user-avatar-initial');

    if (user) {
      if (userDisplay) userDisplay.textContent = user.name;
      if (userRoleDisplay) userRoleDisplay.textContent = user.role;
      if (avatarInit) avatarInit.textContent = user.name.charAt(0).toUpperCase();
      if (authBtnGroup) authBtnGroup.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-flex';
    } else {
      if (userDisplay) userDisplay.textContent = 'Guest User';
      if (userRoleDisplay) userRoleDisplay.textContent = 'Not Logged In';
      if (avatarInit) avatarInit.textContent = 'G';
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

      // Render 6 KPI Sparklines
      ChartsEngine.initSparkline('sparkline-revenue', [12, 14, 15, 18, 20, 22, 25, 28], '#10b981');
      ChartsEngine.initSparkline('sparkline-aov', [150, 152, 155, 154, 158, 160, 162], '#6366f1');
      ChartsEngine.initSparkline('sparkline-orders', [8200, 8500, 8900, 9100, 9500, 9800], '#10b981');
      ChartsEngine.initSparkline('sparkline-predict', [14, 15, 16.5, 17, 17.37], '#a855f7');
      ChartsEngine.initSparkline('sparkline-demand', [102, 108, 112, 115, 118.5], '#10b981');
      ChartsEngine.initSparkline('sparkline-margin', [31.2, 32.5, 33.1, 34.0, 34.8], '#10b981');

      // Render Charts
      const monthly = await API.getMonthlyRevenue();
      ChartsEngine.initMonthlyRevenueChart('monthly-revenue-chart', monthly);

      const weekly = await API.getWeeklyRevenue();
      ChartsEngine.initWeeklyRevenueChart('weekly-revenue-chart', weekly);

      const insights = await API.getCustomerInsights();
      ChartsEngine.initCustomerStateChart('customer-state-chart', insights);

      const fi = await API.getFeatureImportance();
      ChartsEngine.initFeatureImportanceChart('feature-importance-chart', fi);
    } catch (e) {
      console.error('Error loading dashboard:', e);
    }
  },

  handleFilterChange() {
    this.showNotification('Global filters updated', 'info');
    this.loadDashboard();
  },

  async loadProducts(search = '') {
    try {
      const res = await API.getProducts(1, search);
      const tbody = document.getElementById('products-table-body');
      if (!tbody) return;

      tbody.innerHTML = res.products.map(p => `
        <tr>
          <td><strong style="color: var(--text-heading);">${p.product_id}</strong></td>
          <td><span class="kpi-trend-pill purple">${p.category_name}</span></td>
          <td>${p.product_weight_g} g</td>
          <td>${p.product_length_cm} × ${p.product_height_cm} × ${p.product_width_cm} cm</td>
          <td><strong style="color: var(--revenue-green);">R$ ${p.current_price.toFixed(2)}</strong></td>
          <td>
            <button class="btn-luxury btn-ghost" onclick="App.triggerRecommend('${p.product_id}', ${p.current_price}, ${p.product_weight_g})" style="padding: 4px 10px; font-size: 11.5px;">Optimize AI</button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      console.error('Error loading products:', e);
    }
  },

  handleProductSearch(query) {
    this.loadProducts(query);
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

      tbody.innerHTML = perf.map(m => {
        const rank = m.Rank || 1;
        const modelName = m.Model || m.Model_Name || 'Regressor';
        const r2 = (m.R2_Score || 0) * 100;
        const cv = (m.CV_Score || 0) * 100;
        const rmse = m.RMSE_BRL !== undefined ? m.RMSE_BRL : (m.RMSE !== undefined ? m.RMSE : 20.0);
        const mae = m.MAE_BRL !== undefined ? m.MAE_BRL : (m.MAE !== undefined ? m.MAE : 5.0);
        const trainTime = m.Training_Time !== undefined ? `${m.Training_Time.toFixed(2)}s` : '0.5s';
        const inferTime = m.Inference_Time !== undefined ? `${(m.Inference_Time * 1000).toFixed(1)}ms` : '5.0ms';

        return `
          <tr>
            <td><span class="badge-rank ${rank === 1 ? 'gold' : 'standard'}">#${rank}</span></td>
            <td><strong style="color: var(--text-heading);">${modelName}</strong> ${rank === 1 ? '🏆 (Best Model)' : ''}</td>
            <td><span class="kpi-trend-pill green">${r2.toFixed(2)}%</span></td>
            <td>${cv.toFixed(2)}%</td>
            <td>R$ ${rmse.toFixed(2)}</td>
            <td>R$ ${mae.toFixed(2)}</td>
            <td>${trainTime}</td>
            <td>${inferTime}</td>
          </tr>
        `;
      }).join('');
    } catch (e) {
      console.error('Error loading analytics:', e);
    }
  },

  exportTableCSV(tbodyId, filename) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    let csv = [];
    const rows = tbody.querySelectorAll('tr');
    for (let r of rows) {
      const cols = r.querySelectorAll('td, th');
      const rowData = Array.from(cols).map(c => `"${c.innerText.replace(/"/g, '""')}"`).join(',');
      csv.push(rowData);
    }

    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    a.click();
    this.showNotification(`Exported ${filename}`, 'success');
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
