/* PricePilot AI — Enterprise ApexCharts Visualization Engine */
const ChartsEngine = {
  chartInstances: {},

  initSparkline(containerId, data, color = '#6366f1') {
    const options = {
      chart: {
        type: 'line',
        height: 36,
        sparkline: { enabled: true },
        background: 'transparent'
      },
      stroke: { curve: 'smooth', width: 2 },
      colors: [color],
      series: [{ name: 'Trend', data }],
      tooltip: { enabled: false }
    };
    this.renderOrUpdate(containerId, containerId, options);
  },

  initMonthlyRevenueChart(containerId, monthlyData) {
    const options = {
      chart: {
        type: 'area',
        height: 300,
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: 'Inter, sans-serif'
      },
      theme: { mode: 'dark' },
      colors: ['#6366f1', '#a855f7'],
      stroke: { curve: 'smooth', width: 2.5 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.35,
          opacityTo: 0.02,
          stops: [0, 95, 100]
        }
      },
      xaxis: {
        categories: monthlyData.labels,
        labels: { style: { colors: '#9ca3af', fontSize: '11px' } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          style: { colors: '#9ca3af', fontSize: '11px' },
          formatter: (v) => `R$ ${(v / 1000).toFixed(0)}k`
        }
      },
      series: monthlyData.series,
      grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 3 },
      legend: { position: 'top', horizontalAlign: 'right', labels: { colors: '#9ca3af' } }
    };
    this.renderOrUpdate('monthlyRevenue', containerId, options);
  },

  initWeeklyRevenueChart(containerId, weeklyData) {
    const options = {
      chart: {
        type: 'bar',
        height: 300,
        toolbar: { show: false },
        background: 'transparent',
        fontFamily: 'Inter, sans-serif'
      },
      theme: { mode: 'dark' },
      colors: ['#10b981', '#06b6d4'],
      xaxis: {
        categories: weeklyData.labels,
        labels: { style: { colors: '#9ca3af', fontSize: '11px' } },
        axisBorder: { show: false }
      },
      yaxis: [
        { labels: { style: { colors: '#9ca3af', fontSize: '11px' }, formatter: (v) => `R$ ${(v / 1000).toFixed(0)}k` } },
        { opposite: true, labels: { style: { colors: '#9ca3af', fontSize: '11px' } } }
      ],
      series: weeklyData.series,
      plotOptions: { bar: { borderRadius: 4, columnWidth: '45%' } },
      grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 3 },
      legend: { position: 'top', horizontalAlign: 'right', labels: { colors: '#9ca3af' } }
    };
    this.renderOrUpdate('weeklyRevenue', containerId, options);
  },

  initCustomerStateChart(containerId, insights) {
    const options = {
      chart: { type: 'donut', height: 280, background: 'transparent', fontFamily: 'Inter, sans-serif' },
      theme: { mode: 'dark' },
      labels: insights.customers_by_state.labels,
      series: insights.customers_by_state.data,
      colors: ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#64748b'],
      stroke: { width: 0 },
      legend: { position: 'bottom', labels: { colors: '#9ca3af' } }
    };
    this.renderOrUpdate('customerState', containerId, options);
  },

  initFeatureImportanceChart(containerId, fiData) {
    const options = {
      chart: { type: 'bar', height: 280, toolbar: { show: false }, background: 'transparent', fontFamily: 'Inter, sans-serif' },
      theme: { mode: 'dark' },
      colors: ['#6366f1'],
      plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '55%' } },
      xaxis: { labels: { style: { colors: '#9ca3af', fontSize: '11px' } } },
      yaxis: { categories: fiData.features, labels: { style: { colors: '#9ca3af', fontSize: '11px' } } },
      series: [{ name: 'Importance Score', data: fiData.composite_score }],
      grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 3 }
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
