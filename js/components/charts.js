window.DP = window.DP || {};

window.DP.ChartManager = class {
  constructor() {
    this.charts = {};
    this.incidentHistory = [];
    this.monteCarloHistory = [];
  }

  init() {
    this.initIncidentTrendChart();
    this.initResourceDoughnutChart();
    this.initSeverityBarChart();
    this.initThreatRadarChart();
    this.initMonteCarloChart();
  }

  initIncidentTrendChart() {
    const ctx = document.getElementById('chart-incident-trend');
    if (!ctx) return;

    this.charts.incidentTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['-6h', '-5h', '-4h', '-3h', '-2h', '-1h', 'Now'],
        datasets: [{
          label: 'Active Incidents',
          data: [4, 6, 8, 12, 10, 14, 11],
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0,212,255,0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#00d4ff',
          pointRadius: 3
        }, {
          label: 'Critical Incidents',
          data: [1, 2, 3, 5, 4, 6, 4],
          borderColor: '#ff1744',
          backgroundColor: 'rgba(255,23,68,0.08)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#ff1744',
          pointRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: '#8892aa', boxWidth: 10, font: { size: 10 } }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8892aa' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8892aa' } }
        }
      }
    });
  }

  initResourceDoughnutChart() {
    const ctx = document.getElementById('chart-resource-allocation');
    if (!ctx) return;

    this.charts.resourceAllocation = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Ambulance', 'Fire Engine', 'Rescue Team', 'Helicopter', 'Medical Unit', 'Supply Truck'],
        datasets: [{
          data: [30, 22, 20, 8, 12, 8],
          backgroundColor: ['#00e676', '#ff6d00', '#7c4dff', '#00d4ff', '#ffd600', '#ff1744'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#8892aa', boxWidth: 10, font: { size: 10 } }
          }
        }
      }
    });
  }

  initSeverityBarChart() {
    const ctx = document.getElementById('chart-severity-distribution');
    if (!ctx) return;

    this.charts.severityDistribution = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['L1 Minimal', 'L2 Low', 'L3 Moderate', 'L4 High', 'L5 Critical'],
        datasets: [{
          label: 'Incidents',
          data: [1, 3, 5, 4, 2],
          backgroundColor: ['#40c4ff', '#00e676', '#ffd600', '#ff6d00', '#ff1744'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#8892aa', font: { size: 9 } } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8892aa' } }
        }
      }
    });
  }

  initThreatRadarChart() {
    const ctx = document.getElementById('chart-threat-radar');
    if (!ctx) return;

    this.charts.threatRadar = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Hurricane', 'Earthquake', 'Wildfire', 'Flood', 'Chemical', 'Tsunami', 'Tornado'],
        datasets: [{
          label: 'Bayesian Probability',
          data: [80, 20, 40, 60, 10, 15, 30],
          borderColor: '#ff1744',
          backgroundColor: 'rgba(255,23,68,0.15)',
          pointBackgroundColor: '#ff1744',
          pointRadius: 3
        }, {
          label: 'Prior Baseline',
          data: [8, 6, 10, 15, 4, 3, 7],
          borderColor: 'rgba(255,255,255,0.2)',
          backgroundColor: 'rgba(255,255,255,0.04)',
          pointBackgroundColor: 'rgba(255,255,255,0.3)',
          pointRadius: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: '#8892aa', boxWidth: 10, font: { size: 10 } }
          }
        },
        scales: {
          r: {
            angleLines: { color: 'rgba(255,255,255,0.08)' },
            grid:        { color: 'rgba(255,255,255,0.08)' },
            pointLabels: { color: '#8892aa', font: { size: 9 } },
            ticks:       { display: false },
            suggestedMin: 0,
            suggestedMax: 100
          }
        }
      }
    });
  }

  initMonteCarloChart() {
    const ctx = document.getElementById('chart-monte-carlo');
    if (!ctx) return;

    // Generate initial convergence curve (simulated)
    const labels = Array.from({ length: 20 }, (_, i) => `${(i + 1) * 25}`);
    const buildConvergence = (start, end) =>
      labels.map((_, i) => {
        const t = i / 19;
        return parseFloat((start + (end - start) * (1 - Math.exp(-3 * t)) + (Math.random() * 0.04 - 0.02)).toFixed(3));
      });

    this.charts.monteCarlo = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: '90% Confidence Zone',
          data: buildConvergence(0.3, 0.92),
          borderColor: '#ff1744',
          backgroundColor: 'rgba(255,23,68,0.1)',
          fill: true,
          tension: 0.5,
          pointRadius: 0,
          borderWidth: 2
        }, {
          label: '70% Confidence Zone',
          data: buildConvergence(0.2, 0.74),
          borderColor: '#ff6d00',
          backgroundColor: 'rgba(255,109,0,0.08)',
          fill: true,
          tension: 0.5,
          pointRadius: 0,
          borderWidth: 2
        }, {
          label: '50% Confidence Zone',
          data: buildConvergence(0.1, 0.54),
          borderColor: '#ffd600',
          backgroundColor: 'rgba(255,214,0,0.08)',
          fill: true,
          tension: 0.5,
          pointRadius: 0,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: '#8892aa', boxWidth: 10, font: { size: 10 } }
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${(ctx.raw * 100).toFixed(1)}%`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#8892aa', font: { size: 9 } },
            title: { display: true, text: 'Simulation Iterations', color: '#4a5568', font: { size: 9 } }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: {
              color: '#8892aa',
              callback: val => `${(val * 100).toFixed(0)}%`
            },
            title: { display: true, text: 'Spread Probability', color: '#4a5568', font: { size: 9 } },
            min: 0,
            max: 1
          }
        }
      }
    });
  }

  resizeAll() {
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.resize === 'function') {
        chart.resize();
      }
    });
  }

  update(data) {
    const { simulator, ai } = data;
    if (!this.charts.incidentTrend) this.init();

    // Update Analytics KPI summary elements if present
    const bayValEl = document.getElementById('analytics-kpi-bayesian');
    const bayTypeEl = document.getElementById('analytics-kpi-bayesian-type');
    if (bayValEl && ai?.bayesian) {
      const top = ai.bayesian.getTopThreat();
      bayValEl.textContent = `${Math.round((top.probability || 0) * 100)}%`;
      if (bayTypeEl) bayTypeEl.textContent = top.type ? window.DP.Helpers.capitalize(top.type) : 'Inference Engine';
    }

    const monteEl = document.getElementById('analytics-kpi-monte');
    if (monteEl && ai?.monteCarlo?.results) {
      monteEl.textContent = `${(ai.monteCarlo.results.maxProbability * 100).toFixed(1)}%`;
    }

    const dtreeEl = document.getElementById('analytics-kpi-dtree');
    if (dtreeEl && ai?.decisionTree) {
      dtreeEl.textContent = `${ai.decisionTree.getAverageSeverity()} / 5.0`;
    }

    const corrEl = document.getElementById('analytics-kpi-corridors');
    if (corrEl && ai?.astar) {
      corrEl.textContent = `${(ai.astar.routes || []).length} active`;
    }

    // Update Threat Radar with Bayesian posteriors
    if (this.charts.threatRadar && ai?.bayesian) {
      const threats = ai.bayesian.posteriors;
      const sortedTypes = ['hurricane', 'earthquake', 'wildfire', 'flood', 'chemical', 'tsunami', 'tornado'];
      this.charts.threatRadar.data.datasets[0].data =
        sortedTypes.map(t => Math.round((threats[t] || 0) * 100));
      this.charts.threatRadar.update();
    }

    // Update Severity Bar with Decision Tree distribution
    if (this.charts.severityDistribution && ai?.decisionTree) {
      const dist = ai.decisionTree.getSeverityDistribution();
      this.charts.severityDistribution.data.datasets[0].data =
        [dist[1] || 0, dist[2] || 0, dist[3] || 0, dist[4] || 0, dist[5] || 0];
      this.charts.severityDistribution.update();
    }

    // Update Incident Trend (rolling window)
    if (this.charts.incidentTrend && simulator) {
      const stats = simulator.getStats();
      this.incidentHistory.push(stats.active);
      if (this.incidentHistory.length > 7) this.incidentHistory.shift();
      while (this.incidentHistory.length < 7) this.incidentHistory.unshift(0);
      this.charts.incidentTrend.data.datasets[0].data = [...this.incidentHistory];
      this.charts.incidentTrend.update();
    }

    // Update Monte Carlo chart with fresh convergence data when simulation runs
    if (this.charts.monteCarlo && ai?.monteCarlo?.results) {
      const res = ai.monteCarlo.results;
      const maxProb = res.maxProbability || 0.5;
      const zones = res.confidenceZones || [];

      // Recompute convergence curves based on actual maxProb
      const labels = Array.from({ length: 20 }, (_, i) => `${(i + 1) * 25}`);
      const curve = (factor) => labels.map((_, i) => {
        const t = i / 19;
        return window.DP.Helpers.clamp(
          maxProb * factor * (1 - Math.exp(-3 * t)) + (Math.random() * 0.03 - 0.015),
          0, 1
        );
      });

      this.charts.monteCarlo.data.datasets[0].data = curve(1.0);
      this.charts.monteCarlo.data.datasets[1].data = curve(0.78);
      this.charts.monteCarlo.data.datasets[2].data = curve(0.56);
      this.charts.monteCarlo.update();
    }

    // Update Resource Doughnut from simulator
    if (this.charts.resourceAllocation && simulator?.resources?.length > 0) {
      const types = ['AMBULANCE', 'FIRE_ENGINE', 'RESCUE_TEAM', 'HELICOPTER', 'MEDICAL_UNIT', 'SUPPLY_TRUCK'];
      const counts = types.map(t =>
        simulator.resources.filter(r => r.type?.toUpperCase() === t).length
      );
      if (counts.some(c => c > 0)) {
        this.charts.resourceAllocation.data.datasets[0].data = counts;
        this.charts.resourceAllocation.update();
      }
    }
  }
};
