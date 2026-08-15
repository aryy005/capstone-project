window.DP = window.DP || {};

window.DP.ChartManager = class {
  constructor() {
    this.charts = {};
  }

  init() {
    this.initIncidentTrendChart();
    this.initResourceDoughnutChart();
    this.initSeverityBarChart();
    this.initThreatRadarChart();
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
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
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
        labels: ['Ambulance', 'Fire Engine', 'Rescue Team', 'Helicopter', 'Medical Unit'],
        datasets: [{
          data: [35, 25, 20, 10, 10],
          backgroundColor: ['#00e676', '#ff6d00', '#7c4dff', '#00d4ff', '#ffd600'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { color: '#8892aa', boxWidth: 12 } } }
      }
    });
  }

  initSeverityBarChart() {
    const ctx = document.getElementById('chart-severity-distribution');
    if (!ctx) return;

    this.charts.severityDistribution = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['L1 Minimal', 'L2 Low', 'L3 Mod', 'L4 High', 'L5 Crit'],
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
          x: { grid: { display: false }, ticks: { color: '#8892aa' } },
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
          label: 'Current Probability',
          data: [80, 20, 40, 60, 10, 15, 30],
          borderColor: '#ff1744',
          backgroundColor: 'rgba(255,23,68,0.2)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            angleLines: { color: 'rgba(255,255,255,0.1)' },
            grid: { color: 'rgba(255,255,255,0.1)' },
            pointLabels: { color: '#8892aa', font: { size: 10 } },
            ticks: { display: false }
          }
        }
      }
    });
  }

  update(data) {
    const { simulator, ai } = data;
    if (!this.charts.incidentTrend) this.init();

    // Update Threat Radar
    if (this.charts.threatRadar && ai?.bayesian) {
      const threats = ai.bayesian.posteriors;
      const sortedTypes = ['hurricane', 'earthquake', 'wildfire', 'flood', 'chemical', 'tsunami', 'tornado'];
      this.charts.threatRadar.data.datasets[0].data = sortedTypes.map(t => Math.round((threats[t] || 0) * 100));
      this.charts.threatRadar.update();
    }

    // Update Severity Bar
    if (this.charts.severityDistribution && ai?.decisionTree) {
      const dist = ai.decisionTree.getSeverityDistribution();
      this.charts.severityDistribution.data.datasets[0].data = [dist[1]||0, dist[2]||0, dist[3]||0, dist[4]||0, dist[5]||0];
      this.charts.severityDistribution.update();
    }
  }
};
