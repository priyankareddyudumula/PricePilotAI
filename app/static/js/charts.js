/* PricePilot AI — ApexCharts Visualization Engine */
const ChartsEngine = {
  chartInstances: {},

  initMonthlyRevenueChart(containerId, monthlyData) {
    const options = {
      chart: { type: 'area', height: 320, toolbar: { show: false }, background: 'transparent' },
      theme: { mode: 'dark' },
      colors: ['#6366f1', '#a855f7'],
      stroke: { curve: 'smooth', width: 3 },
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05 } },
      xaxis: { categories: monthlyData.labels, labels: { style: { colors: '#94a3b8' } } },
      yaxis: { labels: { style: { colors: '#94a3b8' }, formatter: (v) => `R$ ${(v/1000).toFixed(0)}k` } },
      series: monthlyData.series,
      grid: { borderColor: 'rgba(255,255,255,0.08)' }
    };
    this.renderOrUpdate('monthlyRevenue', containerId, options);
  },

  initWeeklyRevenueChart(containerId, weeklyData) {
    const options = {
      chart: { type: 'bar', height: 320, toolbar: { show: false }, background: 'transparent' },
      theme: { mode: 'dark' },
      colors: ['#10b981', '#06b6d4'],
      xaxis: { categories: weeklyData.labels, labels: { style: { colors: '#94a3b8' } } },
      yaxis: [
        { labels: { style: { colors: '#94a3b8' }, formatter: (v) => `R$ ${(v/1000).toFixed(0)}k` } },
        { opposite: true, labels: { style: { colors: '#94a3b8' } } }
      ],
      series: weeklyData.series,
      plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
      grid: { borderColor: 'rgba(255,255,255,0.08)' }
    };
    this.renderOrUpdate('weeklyRevenue', containerId, options);
  },

  initCustomerStateChart(containerId, insights) {
    const options = {
      chart: { type: 'donut', height: 300, background: 'transparent' },
      theme: { mode: 'dark' },
      labels: insights.customers_by_state.labels,
      series: insights.customers_by_state.data,
      colors: ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#64748b'],
      legend: { position: 'bottom', labels: { colors: '#94a3b8' } }
    };
    this.renderOrUpdate('customerState', containerId, options);
  },

  initFeatureImportanceChart(containerId, fiData) {
    const options = {
      chart: { type: 'bar', height: 320, toolbar: { show: false }, background: 'transparent' },
      theme: { mode: 'dark' },
      colors: ['#6366f1'],
      plotOptions: { bar: { horizontal: true, borderRadius: 6 } },
      xaxis: { labels: { style: { colors: '#94a3b8' } } },
      yaxis: { categories: fiData.features, labels: { style: { colors: '#94a3b8' } } },
      series: [{ name: 'Importance Score', data: fiData.composite_score }],
      grid: { borderColor: 'rgba(255,255,255,0.08)' }
    };
    this.renderOrUpdate('featureImportance', containerId, options);
  },

  renderOrUpdate(key, containerId, options) {
    if (this.chartInstances[key]) {
      this.chartInstances[key].destroy();
    }
    const el = document.getElementById(containerId);
    if (el) {
      this.chartInstances[key] = new ApexCharts(el, options);
      this.chartInstances[key].render();
    }
  }
};
