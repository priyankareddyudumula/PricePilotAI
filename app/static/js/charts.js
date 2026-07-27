/* PricePilot AI — Luxury Interactive ApexCharts Engine */
const ChartsEngine = {
  chartInstances: {},

  initSparkline(containerId, data, color = '#6366f1') {
    const options = {
      chart: {
        type: 'area',
        height: 32,
        sparkline: { enabled: true },
        background: 'transparent'
      },
      stroke: { curve: 'smooth', width: 2 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05 }
      },
      colors: [color],
      series: [{ name: 'Metric Trend', data }],
      tooltip: { enabled: false },
      dataLabels: { enabled: false }
    };
    this.renderOrUpdate(containerId, containerId, options);
  },

  initMonthlyRevenueChart(containerId, monthlyData) {
    const options = {
      chart: {
        type: 'area',
        height: 340,
        toolbar: {
          show: true,
          tools: { download: true, selection: true, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true }
        },
        background: 'transparent',
        fontFamily: 'Plus Jakarta Sans, sans-serif'
      },
      theme: { mode: 'dark' },
      colors: ['#6366f1', '#a855f7'],
      stroke: { curve: 'smooth', width: 2.5 },
      dataLabels: { enabled: false }, // CRITICAL FIX: Hide overlapping point text labels
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.40,
          opacityTo: 0.03,
          stops: [0, 95, 100]
        }
      },
      xaxis: {
        categories: monthlyData.labels,
        labels: { style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 500 } },
        axisBorder: { show: false },
        axisTicks: { show: false },
        crosshairs: { show: true, stroke: { color: '#6366f1', dashArray: 4 } }
      },
      yaxis: {
        labels: {
          style: { colors: '#94a3b8', fontSize: '11px' },
          formatter: (v) => `R$ ${(v / 1000).toFixed(0)}k`
        }
      },
      series: monthlyData.series,
      grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 3 },
      legend: { position: 'top', horizontalAlign: 'right', labels: { colors: '#94a3b8' } },
      tooltip: {
        shared: true,
        intersect: false,
        theme: 'dark',
        y: {
          formatter: (val) => `R$ ${val ? val.toLocaleString() : '0'}`
        }
      }
    };
    this.renderOrUpdate('monthlyRevenue', containerId, options);
  },

  initWeeklyRevenueChart(containerId, weeklyData) {
    const options = {
      chart: {
        type: 'bar',
        height: 340,
        toolbar: {
          show: true,
          tools: { download: true, selection: true, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true }
        },
        background: 'transparent',
        fontFamily: 'Plus Jakarta Sans, sans-serif'
      },
      theme: { mode: 'dark' },
      colors: ['#10b981', '#06b6d4'],
      dataLabels: { enabled: false }, // CRITICAL FIX: Hide overlapping point text labels
      xaxis: {
        categories: weeklyData.labels,
        labels: { style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 500 } },
        axisBorder: { show: false }
      },
      yaxis: [
        { labels: { style: { colors: '#94a3b8', fontSize: '11px' }, formatter: (v) => `R$ ${(v / 1000).toFixed(0)}k` } },
        { opposite: true, labels: { style: { colors: '#94a3b8', fontSize: '11px' } } }
      ],
      series: weeklyData.series,
      plotOptions: { bar: { borderRadius: 6, columnWidth: '45%' } },
      grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 3 },
      legend: { position: 'top', horizontalAlign: 'right', labels: { colors: '#94a3b8' } },
      tooltip: { theme: 'dark' }
    };
    this.renderOrUpdate('weeklyRevenue', containerId, options);
  },

  initCustomerStateChart(containerId, insights) {
    const options = {
      chart: { type: 'donut', height: 300, background: 'transparent', fontFamily: 'Plus Jakarta Sans, sans-serif' },
      theme: { mode: 'dark' },
      labels: insights.customers_by_state.labels,
      series: insights.customers_by_state.data,
      colors: ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#64748b'],
      stroke: { width: 0 },
      dataLabels: { enabled: false }, // CRITICAL FIX: Clean legend tooltips
      legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
      tooltip: { theme: 'dark' }
    };
    this.renderOrUpdate('customerState', containerId, options);
  },

  initFeatureImportanceChart(containerId, fiData) {
    const options = {
      chart: { type: 'bar', height: 300, toolbar: { show: true }, background: 'transparent', fontFamily: 'Plus Jakarta Sans, sans-serif' },
      theme: { mode: 'dark' },
      colors: ['#6366f1'],
      dataLabels: { enabled: false }, // CRITICAL FIX: Hide overlapping point text labels
      plotOptions: { bar: { horizontal: true, borderRadius: 5, barHeight: '55%' } },
      xaxis: { labels: { style: { colors: '#94a3b8', fontSize: '11px' } } },
      yaxis: { categories: fiData.features, labels: { style: { colors: '#94a3b8', fontSize: '11px' } } },
      series: [{ name: 'Importance Score', data: fiData.composite_score }],
      grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 3 },
      tooltip: { theme: 'dark' }
    };
    this.renderOrUpdate('featureImportance', containerId, options);
  },

  initDemandForecastChart(containerId, forecastData) {
    if (!forecastData || !forecastData.daily_forecast) return;

    const dates = forecastData.daily_forecast.map(d => d.date || `Day ${d.day}`);
    const forecast = forecastData.daily_forecast.map(d => d.forecasted_demand);
    const upperBound = forecastData.daily_forecast.map(d => d.upper_bound);
    const lowerBound = forecastData.daily_forecast.map(d => d.lower_bound);

    const options = {
      chart: {
        type: 'line',
        height: 340,
        toolbar: { show: true },
        background: 'transparent',
        fontFamily: 'Plus Jakarta Sans, sans-serif'
      },
      theme: { mode: 'dark' },
      colors: ['#6366f1', '#10b981', '#ef4444'],
      stroke: { curve: 'smooth', width: [3, 1.5, 1.5], dashArray: [0, 4, 4] },
      dataLabels: { enabled: false },
      series: [
        { name: 'Projected Demand (Units)', data: forecast },
        { name: 'Upper Bound (95% CI)', data: upperBound },
        { name: 'Lower Bound (95% CI)', data: lowerBound }
      ],
      xaxis: { categories: dates, labels: { style: { colors: '#94a3b8', fontSize: '11px' } } },
      yaxis: { labels: { style: { colors: '#94a3b8', fontSize: '11px' } } },
      grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 3 },
      legend: { position: 'top', labels: { colors: '#94a3b8' } },
      tooltip: { theme: 'dark' }
    };
    this.renderOrUpdate('demandForecast', containerId, options);
  },

  initPriceElasticityChart(containerId, elasticityData) {
    if (!elasticityData || !elasticityData.elasticity_curve) return;

    const prices = elasticityData.elasticity_curve.map(d => `R$ ${d.price.toFixed(2)}`);
    const demand = elasticityData.elasticity_curve.map(d => d.projected_demand);
    const profit = elasticityData.elasticity_curve.map(d => d.projected_profit);

    const options = {
      chart: {
        type: 'line',
        height: 320,
        toolbar: { show: true },
        background: 'transparent',
        fontFamily: 'Plus Jakarta Sans, sans-serif'
      },
      theme: { mode: 'dark' },
      colors: ['#10b981', '#a855f7'],
      stroke: { curve: 'smooth', width: [3, 2] },
      dataLabels: { enabled: false },
      series: [
        { name: 'Projected Profit (BRL)', data: profit },
        { name: 'Expected Demand (Units)', data: demand }
      ],
      xaxis: { categories: prices, labels: { style: { colors: '#94a3b8', fontSize: '11px' } } },
      yaxis: [
        { labels: { style: { colors: '#94a3b8', fontSize: '11px' }, formatter: (v) => `R$ ${v}` } },
        { opposite: true, labels: { style: { colors: '#94a3b8', fontSize: '11px' } } }
      ],
      grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 3 },
      legend: { position: 'top', labels: { colors: '#94a3b8' } },
      tooltip: { theme: 'dark' }
    };
    this.renderOrUpdate('priceElasticity', containerId, options);
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
