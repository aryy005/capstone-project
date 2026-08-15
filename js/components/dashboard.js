window.DP = window.DP || {};

window.DP.DashboardComponent = class {
  constructor() {
    this.elements = {};
  }

  init() {
    this.elements = {
      activeIncidents: document.getElementById('kpi-active-incidents'),
      affectedPop: document.getElementById('kpi-affected-pop'),
      deployedRes: document.getElementById('kpi-deployed-resources'),
      overallThreat: document.getElementById('kpi-overall-threat'),
      topThreatType: document.getElementById('kpi-top-threat-type'),
      incidentList: document.getElementById('incident-list-container'),
      threatRingFill: document.getElementById('threat-ring-fill'),
      threatRingPct: document.getElementById('threat-ring-pct'),
      threatLevelBadge: document.getElementById('threat-level-badge'),
      threatBreakdown: document.getElementById('threat-breakdown-container'),
      aiInsights: document.getElementById('ai-insights-container'),
      weatherGrid: document.getElementById('weather-grid-container')
    };
  }

  render(data) {
    if (!this.elements.activeIncidents) this.init();

    const { simulator, ai, activeScenario } = data;
    const stats = simulator.getStats();

    // KPIs
    if (this.elements.activeIncidents) {
      window.DP.Helpers.animateCounter(this.elements.activeIncidents, parseInt(this.elements.activeIncidents.textContent) || 0, stats.active);
    }
    if (this.elements.affectedPop) {
      window.DP.Helpers.animateCounter(this.elements.affectedPop, parseInt(this.elements.affectedPop.textContent.replace(/,/g,'')) || 0, stats.totalPop);
    }
    if (this.elements.deployedRes) {
      window.DP.Helpers.animateCounter(this.elements.deployedRes, parseInt(this.elements.deployedRes.textContent) || 0, stats.deployed);
    }

    // Threat gauge
    const threatLevel = ai.bayesian.overallThreatLevel;
    const threatPct = Math.round(threatLevel * 100);
    const topThreat = ai.bayesian.getTopThreat();

    if (this.elements.overallThreat) {
      this.elements.overallThreat.textContent = `${threatPct}%`;
    }
    if (this.elements.topThreatType) {
      this.elements.topThreatType.textContent = topThreat.type ? window.DP.Helpers.capitalize(topThreat.type) : 'None';
    }

    // Threat Ring
    if (this.elements.threatRingFill) {
      const radius = 55;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (threatLevel * circumference);
      this.elements.threatRingFill.style.strokeDasharray = `${circumference} ${circumference}`;
      this.elements.threatRingFill.style.strokeDashoffset = offset;
      this.elements.threatRingFill.style.stroke = window.DP.Helpers.severityColor(threatLevel);
    }
    if (this.elements.threatRingPct) {
      this.elements.threatRingPct.textContent = `${threatPct}%`;
      this.elements.threatRingPct.style.color = window.DP.Helpers.severityColor(threatLevel);
    }
    if (this.elements.threatLevelBadge) {
      const label = ai.bayesian.getThreatLabel();
      this.elements.threatLevelBadge.textContent = label;
      this.elements.threatLevelBadge.className = `threat-level-badge badge-${label.toLowerCase()}`;
    }

    // Render Threat Breakdown
    this.renderThreatBreakdown(ai.bayesian.getSortedThreats());

    // Render Incident List
    this.renderIncidents(simulator.incidents);

    // Render Weather
    this.renderWeather(simulator.weatherData);

    // Render AI Insights
    this.renderAIInsights(simulator, ai);
  }

  renderIncidents(incidents) {
    if (!this.elements.incidentList) return;
    const sorted = [...incidents].sort((a, b) => (b.severity || 0) - (a.severity || 0));
    
    if (sorted.length === 0) {
      this.elements.incidentList.innerHTML = '<div class="no-data">No active incidents reported</div>';
      return;
    }

    const html = sorted.map(inc => {
      const icons = window.DP.CONSTANTS.DISASTER_TYPES[inc.type?.toUpperCase()]?.icon || '⚠️';
      const sevClass = `severity-${inc.severity || 1}`;
      const badgeClass = `badge-${(window.DP.CONSTANTS.THREAT_LEVELS[inc.severity - 1] || 'LOW').toLowerCase()}`;
      
      return `
        <div class="incident-item ${sevClass}" onclick="window.DP.App.selectIncident('${inc.id}')">
          ${inc.severity >= 5 ? '<div class="critical-pulse"></div>' : ''}
          <div class="incident-icon">${icons}</div>
          <div class="incident-info">
            <div class="incident-title">${inc.title}</div>
            <div class="incident-meta">
              <span class="badge ${badgeClass}">L${inc.severity} Severity</span>
              <span class="incident-pop">👥 ${(inc.populationAffected || 0).toLocaleString()}</span>
              <span class="incident-time">${window.DP.Helpers.timeAgo(inc.timestamp)}</span>
            </div>
          </div>
          <div class="incident-status-col">
            <span class="status-dot ${inc.status === 'ACTIVE' ? (inc.severity >= 4 ? 'critical' : 'high') : 'low'}"></span>
            <div class="responder-count">🚓 ${inc.responders || 0}</div>
          </div>
        </div>
      `;
    }).join('');

    this.elements.incidentList.innerHTML = html;
  }

  renderThreatBreakdown(threats) {
    if (!this.elements.threatBreakdown) return;
    const html = threats.map(t => {
      const icon = window.DP.CONSTANTS.DISASTER_TYPES[t.type?.toUpperCase()]?.icon || '⚠️';
      const color = window.DP.CONSTANTS.DISASTER_TYPES[t.type?.toUpperCase()]?.color || '#00d4ff';
      return `
        <div class="threat-row">
          <span class="threat-row-icon">${icon}</span>
          <span class="threat-row-label">${window.DP.Helpers.capitalize(t.type)}</span>
          <div class="threat-row-bar progress-bar">
            <div class="progress-fill" style="width: ${t.percentage}%; background: ${color}"></div>
          </div>
          <span class="threat-row-pct">${t.percentage}%</span>
        </div>
      `;
    }).join('');
    this.elements.threatBreakdown.innerHTML = html;
  }

  renderWeather(weather) {
    if (!this.elements.weatherGrid) return;
    const items = [
      { label: 'Wind Speed', val: `${Math.round((weather.windSpeed || 0.5) * 120)} km/h`, pct: (weather.windSpeed || 0.5) * 100, color: '#00d4ff' },
      { label: 'Rainfall', val: `${Math.round((weather.rainfall || 0.3) * 150)} mm`, pct: (weather.rainfall || 0.3) * 100, color: '#00e676' },
      { label: 'Seismic', val: `${((weather.seismicActivity || 0.1) * 9).toFixed(1)} Richter`, pct: (weather.seismicActivity || 0.1) * 100, color: '#ff6d00' },
      { label: 'Humidity', val: `${Math.round((weather.humidity || 0.5) * 100)}%`, pct: (weather.humidity || 0.5) * 100, color: '#7c4dff' }
    ];

    this.elements.weatherGrid.innerHTML = items.map(i => `
      <div class="weather-item">
        <div class="weather-item-label">${i.label}</div>
        <div class="weather-item-value">${i.val}</div>
        <div class="weather-item-bar progress-bar">
          <div class="progress-fill" style="width: ${i.pct}%; background: ${i.color}"></div>
        </div>
      </div>
    `).join('');
  }

  renderAIInsights(simulator, ai) {
    if (!this.elements.aiInsights) return;
    const topThreat = ai.bayesian.getTopThreat();
    const confidence = ai.bayesian.getConfidenceScore();
    const clusters = ai.kmeans.clusters || [];
    const stats = simulator.getStats();

    const insights = [
      { icon: '🧠', text: `Bayesian Threat: Primary hazard identified as <strong>${topThreat.type ? window.DP.Helpers.capitalize(topThreat.type) : 'Unknown'}</strong> with <strong>${confidence}% confidence</strong>.` },
      { icon: '🎯', text: `K-Means Staging: Calculated <strong>${clusters.length} optimal resource clusters</strong> based on incident spatial distribution.` },
      { icon: '🌲', text: `Decision Tree: <strong>${stats.active} incidents evaluated</strong>. ${stats.maxSev >= 4 ? 'Immediate deployment recommended for critical sectors.' : 'Standard protocol maintained.'}` }
    ];

    this.elements.aiInsights.innerHTML = insights.map(i => `
      <div class="ai-insight">
        <span class="ai-insight-icon">${i.icon}</span>
        <span class="ai-insight-text">${i.text}</span>
      </div>
    `).join('');
  }
};
