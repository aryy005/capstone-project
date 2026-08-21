window.DP = window.DP || {};

window.DP.DashboardComponent = class {
  constructor() {
    this.elements = {};
  }

  init() {
    this.elements = {
      activeIncidents: document.getElementById('kpi-active-incidents'),
      affectedPop:     document.getElementById('kpi-affected-pop'),
      deployedRes:     document.getElementById('kpi-deployed-resources'),
      overallThreat:   document.getElementById('kpi-overall-threat'),
      topThreatType:   document.getElementById('kpi-top-threat-type'),
      incidentList:    document.getElementById('incident-list-container'),
      threatRingFill:  document.getElementById('threat-ring-fill'),
      threatRingPct:   document.getElementById('threat-ring-pct'),
      threatLevelBadge:document.getElementById('threat-level-badge'),
      threatBreakdown: document.getElementById('threat-breakdown-container'),
      aiInsights:      document.getElementById('ai-insights-container'),
      weatherGrid:     document.getElementById('weather-grid-container')
    };

    // Create incident detail modal if not present
    if (!document.getElementById('incident-detail-modal')) {
      this._createIncidentModal();
    }
    if (!document.getElementById('active-incidents-list-modal')) {
      this._createActiveIncidentsModal();
    }
  }

  _createActiveIncidentsModal() {
    const modal = document.createElement('div');
    modal.id = 'active-incidents-list-modal';
    modal.innerHTML = `
      <div class="active-inc-card">
        <button class="inc-modal-close" onclick="window.DP.App.ui.dashboard.closeActiveIncidentsModal()">✕</button>
        <div class="active-inc-header">
          <div class="active-inc-title-wrap">
            <span class="active-inc-icon">🚨</span>
            <div>
              <div class="active-inc-title" id="active-inc-modal-title">Live Active Incidents</div>
              <div class="active-inc-subtitle">Real-Time Emergency Response & Command View</div>
            </div>
          </div>
        </div>
        <div class="active-inc-filters">
          <button class="filter-pill active" onclick="window.DP.App.ui.dashboard.filterActiveIncidents('all', this)">All Incidents</button>
          <button class="filter-pill" onclick="window.DP.App.ui.dashboard.filterActiveIncidents(5, this)">🚨 L5 Critical</button>
          <button class="filter-pill" onclick="window.DP.App.ui.dashboard.filterActiveIncidents(4, this)">🔥 L4 High</button>
          <button class="filter-pill" onclick="window.DP.App.ui.dashboard.filterActiveIncidents(3, this)">⚠️ L3 Moderate</button>
          <button class="filter-pill" onclick="window.DP.App.ui.dashboard.filterActiveIncidents(2, this)">🟢 L1-L2 Low</button>
        </div>
        <div class="active-inc-list" id="active-inc-modal-list"></div>
      </div>`;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeActiveIncidentsModal();
    });
    document.body.appendChild(modal);
  }

  showActiveIncidentsModal(sevFilter = 'all') {
    if (!document.getElementById('active-incidents-list-modal')) {
      this._createActiveIncidentsModal();
    }
    this.currentActiveFilter = sevFilter;
    const modal = document.getElementById('active-incidents-list-modal');
    if (modal) modal.classList.add('open');
    this.renderActiveIncidentsModalList();
  }

  closeActiveIncidentsModal() {
    const modal = document.getElementById('active-incidents-list-modal');
    if (modal) modal.classList.remove('open');
  }

  filterActiveIncidents(sev, btnEl) {
    document.querySelectorAll('.active-inc-filters .filter-pill').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    this.currentActiveFilter = sev;
    this.renderActiveIncidentsModalList();
  }

  renderActiveIncidentsModalList() {
    const container = document.getElementById('active-inc-modal-list');
    if (!container) return;

    let incidents = window.DP.App?.simulator?.incidents || [];
    if (this.currentActiveFilter && this.currentActiveFilter !== 'all') {
      if (this.currentActiveFilter === 2) {
        incidents = incidents.filter(i => i.severity <= 2);
      } else {
        incidents = incidents.filter(i => i.severity === Number(this.currentActiveFilter));
      }
    }
    const sorted = [...incidents].sort((a, b) => (b.severity || 0) - (a.severity || 0));

    const titleEl = document.getElementById('active-inc-modal-title');
    if (titleEl) titleEl.textContent = `Live Active Incidents (${sorted.length})`;

    if (sorted.length === 0) {
      container.innerHTML = '<div style="text-align:center; padding: 40px; color: #8892aa;">No incidents found matching current filter</div>';
      return;
    }

    container.innerHTML = sorted.map(inc => {
      const icon = window.DP.CONSTANTS.DISASTER_TYPES[inc.type?.toUpperCase()]?.icon || '⚠️';
      const sevColor = ['#40c4ff','#00e676','#ffd600','#ff6d00','#ff1744'][inc.severity - 1] || '#00d4ff';
      const sevLabel = ['MINIMAL','LOW','MODERATE','HIGH','CRITICAL'][inc.severity - 1] || 'UNKNOWN';

      return `
        <div class="active-inc-row sev-${inc.severity}">
          <span style="font-size: 22px;">${icon}</span>
          <div class="active-inc-row-main">
            <div class="active-inc-row-title">${inc.title}</div>
            <div class="active-inc-row-meta">
              <span style="color: ${sevColor}; font-weight: 700;">L${inc.severity} ${sevLabel}</span>
              <span>👥 ${(inc.populationAffected || 0).toLocaleString()} affected</span>
              <span>🚓 ${inc.responders || 0} responders</span>
              <span>📍 ${(inc.lat||0).toFixed(2)}°, ${(inc.lng||0).toFixed(2)}°</span>
            </div>
          </div>
          <div class="active-inc-row-actions">
            <button class="btn btn-sm" onclick="window.DP.App.ui.dashboard.closeActiveIncidentsModal(); window.DP.App.ui.dashboard.openIncidentModal('${inc.id}')">📄 Details</button>
            <button class="btn btn-sm btn-primary" onclick="window.DP.App.ui.dashboard.closeActiveIncidentsModal(); window.DP.App.selectIncident('${inc.id}')">🗺️ Map</button>
          </div>
        </div>`;
    }).join('');
  }

  _createIncidentModal() {
    const modal = document.createElement('div');
    modal.id = 'incident-detail-modal';
    modal.innerHTML = `
      <div class="inc-modal-card" id="inc-modal-card">
        <button class="inc-modal-close" onclick="window.DP.App.ui.dashboard.closeIncidentModal()">✕</button>
        <div id="inc-modal-body"></div>
      </div>`;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeIncidentModal();
    });
    document.body.appendChild(modal);
  }

  openIncidentModal(incId) {
    const incidents = window.DP.App?.simulator?.incidents || [];
    const inc = incidents.find(i => i.id === incId);
    if (!inc) return;

    const modal = document.getElementById('incident-detail-modal');
    const body  = document.getElementById('inc-modal-body');
    if (!modal || !body) return;

    const icons     = window.DP.CONSTANTS.DISASTER_TYPES[inc.type?.toUpperCase()]?.icon || '⚠️';
    const sevColor  = ['#40c4ff','#00e676','#ffd600','#ff6d00','#ff1744'][inc.severity - 1] || '#00d4ff';
    const sevLabel  = ['MINIMAL','LOW','MODERATE','HIGH','CRITICAL'][inc.severity - 1] || 'UNKNOWN';
    const cls       = inc.classification || {};

    body.innerHTML = `
      <div class="inc-modal-header" style="border-left: 4px solid ${sevColor}">
        <div class="inc-modal-icon">${icons}</div>
        <div>
          <div class="inc-modal-title">${inc.title}</div>
          <div class="inc-modal-sub">${window.DP.Helpers.capitalize(inc.type || 'unknown')} — ${window.DP.Helpers.timeAgo(inc.timestamp)}</div>
        </div>
        <div class="inc-modal-badge" style="color:${sevColor}; border-color:${sevColor}">L${inc.severity} ${sevLabel}</div>
      </div>

      <div class="inc-modal-grid">
        <div class="inc-modal-stat">
          <div class="inc-modal-stat-label">Population Affected</div>
          <div class="inc-modal-stat-value">👥 ${(inc.populationAffected || 0).toLocaleString()}</div>
        </div>
        <div class="inc-modal-stat">
          <div class="inc-modal-stat-label">Responders On-Site</div>
          <div class="inc-modal-stat-value">🚓 ${inc.responders || 0} units</div>
        </div>
        <div class="inc-modal-stat">
          <div class="inc-modal-stat-label">Infrastructure Damage</div>
          <div class="inc-modal-stat-value">🏗️ ${Math.round((inc.infrastructureDamage || 0) * 100)}%</div>
        </div>
        <div class="inc-modal-stat">
          <div class="inc-modal-stat-label">Magnitude / Intensity</div>
          <div class="inc-modal-stat-value">📊 ${(inc.magnitude || 0).toFixed(1)}</div>
        </div>
        <div class="inc-modal-stat">
          <div class="inc-modal-stat-label">Status</div>
          <div class="inc-modal-stat-value" style="color: ${inc.status === 'ACTIVE' ? '#ff1744' : '#00e676'}">
            ● ${inc.status || 'ACTIVE'}
          </div>
        </div>
        <div class="inc-modal-stat">
          <div class="inc-modal-stat-label">GPS Coordinates</div>
          <div class="inc-modal-stat-value">📍 ${(inc.lat||0).toFixed(4)}°, ${(inc.lng||0).toFixed(4)}°</div>
        </div>
      </div>

      ${cls.protocol ? `
      <div class="inc-modal-section">
        <div class="inc-modal-section-title">🌲 AI Decision Tree Assessment</div>
        <div class="inc-modal-row"><span>Protocol</span><span>${cls.protocol}</span></div>
        <div class="inc-modal-row"><span>Severity Label</span><span style="color:${sevColor}">${cls.severityLabel || sevLabel}</span></div>
        ${cls.evacuationRequired ? `<div class="inc-modal-row"><span>Evacuation</span><span style="color:#ff6d00">⚠️ Required</span></div>` : ''}
        ${cls.federalAidRequired ? `<div class="inc-modal-row"><span>Federal Aid</span><span style="color:#ff1744">🆘 Requested</span></div>` : ''}
      </div>` : ''}

      <div class="inc-modal-actions">
        <button class="btn btn-primary" onclick="window.DP.App.selectIncident('${inc.id}'); window.DP.App.ui.dashboard.closeIncidentModal()">
          🗺️ View on Map
        </button>
        <button class="btn" onclick="window.DP.App.ui.dashboard.closeIncidentModal()">Close</button>
      </div>`;

    modal.classList.add('open');
  }

  closeIncidentModal() {
    const modal = document.getElementById('incident-detail-modal');
    if (modal) modal.classList.remove('open');
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
    const threatPct   = Math.round(threatLevel * 100);
    const topThreat   = ai.bayesian.getTopThreat();

    if (this.elements.overallThreat)  this.elements.overallThreat.textContent  = `${threatPct}%`;
    if (this.elements.topThreatType)  this.elements.topThreatType.textContent  = topThreat.type ? window.DP.Helpers.capitalize(topThreat.type) : 'None';

    // Threat Ring SVG
    if (this.elements.threatRingFill) {
      const circumference = 2 * Math.PI * 52;
      this.elements.threatRingFill.style.strokeDasharray  = `${circumference} ${circumference}`;
      this.elements.threatRingFill.style.strokeDashoffset = circumference - (threatLevel * circumference);
      this.elements.threatRingFill.style.stroke = window.DP.Helpers.severityColor(threatLevel);
    }
    if (this.elements.threatRingPct) {
      this.elements.threatRingPct.textContent = `${threatPct}%`;
      this.elements.threatRingPct.style.color = window.DP.Helpers.severityColor(threatLevel);
    }
    if (this.elements.threatLevelBadge) {
      const label = ai.bayesian.getThreatLabel();
      this.elements.threatLevelBadge.textContent = label;
      this.elements.threatLevelBadge.className   = `threat-level-badge badge-${label.toLowerCase()}`;
    }

    this.renderThreatBreakdown(ai.bayesian.getSortedThreats());
    this.renderIncidents(simulator.incidents);
    this.renderWeather(simulator.weatherData);
    this.renderAIInsights(simulator, ai);
  }

  renderIncidents(incidents) {
    if (!this.elements.incidentList) return;
    const sorted = [...incidents].sort((a, b) => (b.severity || 0) - (a.severity || 0));

    if (sorted.length === 0) {
      this.elements.incidentList.innerHTML = '<div class="no-data">No active incidents reported</div>';
      return;
    }

    this.elements.incidentList.innerHTML = sorted.map(inc => {
      const icon     = window.DP.CONSTANTS.DISASTER_TYPES[inc.type?.toUpperCase()]?.icon || '⚠️';
      const sevClass = `severity-${inc.severity || 1}`;
      const badgeCls = `badge-${(window.DP.CONSTANTS.THREAT_LEVELS[inc.severity - 1] || 'LOW').toLowerCase()}`;

      return `
        <div class="incident-item ${sevClass}" onclick="window.DP.App.ui.dashboard.openIncidentModal('${inc.id}')">
          <div class="incident-item-left">
            <div class="incident-type-icon">${icon}</div>
            <div class="incident-info">
              <div class="incident-title">${inc.title}</div>
              <div class="incident-meta">
                <span class="badge ${badgeCls}">L${inc.severity} Severity</span>
                <span class="incident-pop">👥 ${(inc.populationAffected || 0).toLocaleString()}</span>
                <span class="incident-time">${window.DP.Helpers.timeAgo(inc.timestamp)}</span>
              </div>
            </div>
          </div>
          <div class="incident-item-right">
            <div class="responder-count">🚓 ${inc.responders || 0}</div>
            <span class="status-dot ${inc.status === 'ACTIVE' ? (inc.severity >= 4 ? 'critical' : 'high') : 'low'}"></span>
          </div>
        </div>`;
    }).join('');
  }

  renderThreatBreakdown(threats) {
    if (!this.elements.threatBreakdown) return;
    this.elements.threatBreakdown.innerHTML = threats.map(t => {
      const icon  = window.DP.CONSTANTS.DISASTER_TYPES[t.type?.toUpperCase()]?.icon || '⚠️';
      const color = window.DP.CONSTANTS.DISASTER_TYPES[t.type?.toUpperCase()]?.color || '#00d4ff';
      return `
        <div class="threat-row">
          <span class="threat-row-icon">${icon}</span>
          <span class="threat-row-label">${window.DP.Helpers.capitalize(t.type)}</span>
          <div class="threat-row-bar progress-bar">
            <div class="progress-fill" style="width: ${t.percentage}%; background: ${color}"></div>
          </div>
          <span class="threat-row-pct">${t.percentage}%</span>
        </div>`;
    }).join('');
  }

  renderWeather(weather) {
    if (!this.elements.weatherGrid) return;
    const items = [
      { label: 'Wind Speed', val: `${Math.round((weather.windSpeed || 0.5) * 120)} km/h`, pct: (weather.windSpeed || 0.5) * 100, color: '#00d4ff' },
      { label: 'Rainfall',   val: `${Math.round((weather.rainfall  || 0.3) * 150)} mm`,   pct: (weather.rainfall  || 0.3) * 100, color: '#00e676' },
      { label: 'Seismic',    val: `${((weather.seismicActivity || 0.1) * 9).toFixed(1)} R`, pct: (weather.seismicActivity || 0.1) * 100, color: '#ff6d00' },
      { label: 'Humidity',   val: `${Math.round((weather.humidity || 0.5) * 100)}%`,       pct: (weather.humidity  || 0.5) * 100, color: '#7c4dff' }
    ];
    this.elements.weatherGrid.innerHTML = `<div class="weather-grid">${items.map(i => `
      <div class="weather-item">
        <div class="weather-item-label">${i.label}</div>
        <div class="weather-item-value">${i.val}</div>
        <div class="weather-item-bar progress-bar">
          <div class="progress-fill" style="width:${i.pct}%; background:${i.color}"></div>
        </div>
      </div>`).join('')}</div>`;
  }

  renderAIInsights(simulator, ai) {
    if (!this.elements.aiInsights) return;
    const topThreat  = ai.bayesian.getTopThreat();
    const confidence = ai.bayesian.getConfidenceScore();
    const clusters   = ai.kmeans.clusters || [];
    const routes     = ai.astar.routes || [];
    const stats      = simulator.getStats();
    const avgSev     = ai.decisionTree.getAverageSeverity();
    const mcResults  = ai.monteCarlo.results;

    const insights = [
      { icon: '🧠', text: `<strong>Bayesian Network:</strong> Primary threat → <strong>${topThreat.type ? window.DP.Helpers.capitalize(topThreat.type) : 'Unknown'}</strong> at <strong>${(topThreat.probability * 100).toFixed(1)}%</strong> posterior probability.` },
      { icon: '⛺', text: `<strong>K-Means++ Clustering:</strong> Computed <strong>${clusters.length} optimal staging hub${clusters.length !== 1 ? 's' : ''}</strong> across ${stats.active} active incident points.` },
      { icon: '🌲', text: `<strong>Decision Tree Triage:</strong> ${ai.decisionTree.classificationHistory.length} incidents classified — avg severity <strong>${avgSev}/5.0</strong>. ${parseFloat(avgSev) >= 4 ? '⚠️ Full mobilization recommended.' : '✅ Standard protocol active.'}` },
      { icon: '📈', text: `<strong>Monte Carlo:</strong> ${mcResults ? `${mcResults.runs} iterations — peak spread probability <strong>${(mcResults.maxProbability * 100).toFixed(1)}%</strong>.` : 'Simulation pending...'}` },
      { icon: '🛣️', text: `<strong>A* Pathfinding:</strong> <strong>${routes.length} evacuation corridor${routes.length !== 1 ? 's' : ''}</strong> computed with hazard penalty weighting.` }
    ];

    this.elements.aiInsights.innerHTML = insights.map(i => `
      <div class="ai-insight">
        <span class="ai-insight-icon">${i.icon}</span>
        <span class="ai-insight-text">${i.text}</span>
      </div>`).join('');
  }
};
