window.DP = window.DP || {};

class Application {
  constructor() {
    this.ai = {
      bayesian:     new window.DP.BayesianThreatNetwork(),
      astar:        new window.DP.AStarRouter(50),
      kmeans:       new window.DP.KMeansClusterer(),
      decisionTree: new window.DP.SeverityClassifier(),
      monteCarlo:   new window.DP.MonteCarloPredictor(500),
      neuralNet:    new window.DP.NeuralDamagePredictor()
    };

    this.simulator = new window.DP.DataSimulator();
    this.alerts    = new window.DP.AlertSystem();

    this.ui = {
      dashboard: new window.DP.DashboardComponent(),
      map:       new window.DP.MapManager(),
      resources: new window.DP.ResourceManager(),
      comms:     new window.DP.CommsLog(),
      charts:    new window.DP.ChartManager(),
      timeline:  new window.DP.TimelineManager()
    };

    this.compareManager = new window.DP.CompareManager();
    this.currentView      = 'dashboard';
    this.selectedScenario = window.DP.Scenarios.HURRICANE;
  }

  init() {
    console.log('⚡ Initializing AEGIS Platform...');

    // Initialize UI components
    this.ui.dashboard.init();
    this.ui.map.init('map', this.selectedScenario.center, 10);
    this.ui.charts.init();

    // Bind Navigation
    this.bindNavigation();

    // Bind Simulator Events
    this.bindSimulatorEvents();

    // Load Default Scenario
    this.loadScenario('HURRICANE');

    // Initialize Theme
    this.initTheme();

    // Start Simulation Loop
    this.simulator.start(2500);

    // Clock
    this.startClock();
    
    // Request push notifications
    this.alerts.requestPushPermission();
  }

  initTheme() {
    const savedTheme = localStorage.getItem('aegis-theme') || 'dark';
    this.setTheme(savedTheme);
  }

  setTheme(theme) {
    this.currentTheme = theme;
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('aegis-theme', theme);

    const iconEl = document.getElementById('theme-toggle-icon');
    if (iconEl) {
      iconEl.textContent = theme === 'light' ? '🌙' : '☀️';
    }

    if (this.ui.map) this.ui.map.setThemeTile(theme);
    if (this.ui.charts) this.ui.charts.setTheme(theme);
  }

  toggleTheme() {
    const nextTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(nextTheme);
  }

  bindNavigation() {
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      item.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        if (view) this.switchView(view);
      });
    });

    const selector = document.getElementById('scenario-select');
    if (selector) {
      selector.addEventListener('change', (e) => {
        this.loadScenario(e.target.value);
      });
    }
  }

  bindSimulatorEvents() {
    this.simulator.on('scenarioLoaded', ({ scenario }) => {
      this.alerts.scenarioLoaded(scenario.name);
      this.runAIEngine();
      this.updateUI();
    });

    this.simulator.on('tick', (updates) => {
      this.runAIEngine();
      this.updateUI();
    });

    this.simulator.on('newIncident', (inc) => {
      this.alerts.incident(inc);
      const icons = { hurricane:'🌀', earthquake:'🌋', wildfire:'🔥', flood:'🌊', chemical:'☣️' };
      this.ui.timeline.addEvent('incident', `New ${window.DP.Helpers.capitalize(inc.type||'Incident')}`, `${inc.title} — L${inc.severity} severity, ${(inc.populationAffected||0).toLocaleString()} people affected.`, inc.severity, icons[inc.type] || '⚠️');
    });

    this.simulator.on('severityEscalation', (inc) => {
      this.alerts.escalation(inc);
      this.ui.timeline.addEvent('escalation', `Severity Escalated: ${inc.title}`, `Incident upgraded to Level ${inc.severity}. Immediate response may be required.`, inc.severity, '🔺');
    });
  }

  loadScenario(key) {
    const scenario = window.DP.Scenarios[key];
    if (!scenario) return;

    this.selectedScenario = scenario;
    this.simulator.loadScenario(scenario);
    this.ui.timeline?.addEvent('scenario', `Scenario Loaded: ${scenario.name}`, `Switched to ${scenario.name}. ${scenario.incidents?.length || 0} initial incidents loaded.`, 1, '🎯');

    if (this.ui.map.map) {
      this.ui.map.setCenter(scenario.center, 10);
    }
  }

  runAIEngine() {
    // 1. Bayesian Threat Inference
    this.ai.bayesian.infer(this.simulator.weatherData);

    // 2. K-Means Clustering on active incident spatial points
    const activePoints = this.simulator.incidents.map(i => ({
      lat: i.lat, lng: i.lng, severity: i.severity
    }));
    if (activePoints.length > 0) {
      this.ai.kmeans.cluster(activePoints, Math.min(3, activePoints.length));
    }

    // 3. A* Routing for evacuation corridors
    if (this.selectedScenario.evacuationPoints && this.selectedScenario.safeZones) {
      const bounds = this.selectedScenario.bounds || { minLat: 10, maxLat: 35, minLng: 70, maxLng: 90 };
      this.ai.astar.generateEvacuationCorridors(
        this.selectedScenario.evacuationPoints,
        this.selectedScenario.safeZones,
        this.selectedScenario.hazardZones || [],
        bounds
      );
    }

    // 4. Decision Tree — classify each active incident
    this.simulator.incidents.forEach(inc => {
      this.ai.decisionTree.classify(inc);
    });

    // 5. Monte Carlo Disaster Spread Simulation
    const mcParams  = this.selectedScenario.monteCarloParams || { windSpeed: 0.5, humidity: 0.5, windDir: 0.5, rainfall: 0.5 };
    const mcType    = this.selectedScenario.disasterType;
    const mcBounds  = this.selectedScenario.bounds;
    const mcCenter  = this.selectedScenario.center;
    if (['wildfire', 'flood', 'earthquake'].includes(mcType)) {
      this.ai.monteCarlo.run(mcType, mcParams, mcCenter, mcBounds);
    } else {
      // For hurricane / chemical — use wildfire spread as proxy
      this.ai.monteCarlo.run('wildfire', mcParams, mcCenter, mcBounds);
    }

    // 6. Neural Network — Feed-forward damage & casualty prediction
    if (this.simulator.incidents.length > 0) {
      const topIncident = this.simulator.incidents[0];
      this.ai.neuralNet.predict(topIncident, this.simulator.weatherData);
    }
  }

  updateUI() {
    const data = {
      simulator:      this.simulator,
      ai:             this.ai,
      scenario:       this.selectedScenario,
      activeScenario: this.selectedScenario
    };

    // Render Active View
    if (this.currentView === 'dashboard') {
      this.ui.dashboard.render(data);
    } else if (this.currentView === 'map') {
      this.ui.map.render({
        incidents: this.simulator.incidents,
        resources: this.simulator.resources,
        scenario:  this.selectedScenario,
        ai:        this.ai
      });
    } else if (this.currentView === 'resources') {
      this.ui.resources.render(this.simulator.resources);
    } else if (this.currentView === 'comms') {
      this.ui.comms.render(this.simulator.commMessages);
    } else if (this.currentView === 'ai') {
      this.updateAIEngineView();
    }

    // Update charts & global elements always
    this.ui.charts.update(data);

    // Update sidebar threat gauge
    const threatPct = Math.round(this.ai.bayesian.overallThreatLevel * 100);
    const fillEl    = document.getElementById('sidebar-threat-fill');
    if (fillEl) fillEl.style.width = `${threatPct}%`;

    // Update alert badge
    const badgeEl = document.getElementById('alert-badge');
    const criticalCount = this.simulator.incidents.filter(i => i.severity >= 5).length;
    if (badgeEl) badgeEl.textContent = criticalCount > 0 ? criticalCount : '';
  }

  updateAIEngineView() {
    // Bayesian live score
    const bayEl = document.getElementById('ai-card-bayesian-score');
    if (bayEl) {
      const topThreat = this.ai.bayesian.getTopThreat();
      bayEl.textContent = topThreat.type
        ? `${window.DP.Helpers.capitalize(topThreat.type)} @ ${(topThreat.probability * 100).toFixed(1)}%`
        : '—';
    }

    // A* routes count
    const astarEl = document.getElementById('ai-card-astar-routes');
    if (astarEl) {
      astarEl.textContent = `${(this.ai.astar.routes || []).length} active corridors`;
    }

    // K-Means clusters count
    const kmeansEl = document.getElementById('ai-card-kmeans-clusters');
    if (kmeansEl) {
      kmeansEl.textContent = `${(this.ai.kmeans.clusters || []).length} staging hubs`;
    }

    // Decision Tree stats
    const dtreeAvgEl   = document.getElementById('ai-card-dtree-avg');
    const dtreeTotalEl = document.getElementById('ai-card-dtree-total');
    if (dtreeAvgEl)   dtreeAvgEl.textContent   = `${this.ai.decisionTree.getAverageSeverity()} / 5.0`;
    if (dtreeTotalEl) dtreeTotalEl.textContent  = `${this.ai.decisionTree.classificationHistory.length} incidents`;

    // Monte Carlo max probability
    const monteEl = document.getElementById('ai-card-monte-prob');
    if (monteEl && this.ai.monteCarlo.results) {
      monteEl.textContent = `${(this.ai.monteCarlo.results.maxProbability * 100).toFixed(1)}% (${this.ai.monteCarlo.results.runs} runs)`;
    }
  }

  toggleCompareMode() {
    const compareView = document.getElementById('compare-view');
    const isComparing = compareView && compareView.style.display !== 'none';

    // Hide all views
    document.querySelectorAll('.view-container').forEach(el => el.style.display = 'none');

    if (!isComparing) {
      if (compareView) compareView.style.display = 'block';
      if (!this.compareManager._initialized) {
        this.compareManager.init();
        this.compareManager._initialized = true;
      }
      document.getElementById('compare-btn')?.classList.add('btn-primary');
      // Remove active state from all nav items
      document.querySelectorAll('.nav-item[data-view]').forEach(el => el.classList.remove('active'));
    } else {
      this.switchView(this.currentView);
      document.getElementById('compare-btn')?.classList.remove('btn-primary');
    }
  }

  switchView(viewId) {
    this.currentView = viewId;

    // Update nav active state
    document.querySelectorAll('.nav-item[data-view]').forEach(el => {
      el.classList.toggle('active', el.dataset.view === viewId);
    });

    // Hide all view containers
    document.querySelectorAll('.view-container').forEach(el => {
      el.style.display = 'none';
    });

    // Show selected view — dashboard and map use flex, others use block
    const target = document.getElementById(`${viewId}-view`);
    if (target) {
      const flexViews = ['dashboard', 'map'];
      target.style.display = flexViews.includes(viewId) ? 'flex' : 'block';
    }

    // Lazy init dashboard embedded map
    if (viewId === 'dashboard') {
      requestAnimationFrame(() => {
        this.ensureDashboardMap();
        if (this.ui.charts) {
          this.ui.charts.resizeAll();
        }
      });
    }

    // Map lazy-init: only create Leaflet when container is visible with real dimensions
    if (viewId === 'map') {
      requestAnimationFrame(() => {
        this.ui.map.ensureInit();
        if (this.ui.map.map) {
          this.ui.map.map.invalidateSize();
          this.ui.map.setCenter(this.selectedScenario.center, 10);
        }
        this.ui.map.render({
          incidents: this.simulator.incidents,
          resources: this.simulator.resources,
          scenario:  this.selectedScenario,
          ai:        this.ai
        });
      });
      return;
    }

    if (viewId === 'analytics') {
      requestAnimationFrame(() => {
        if (this.ui.charts) {
          this.ui.charts.resizeAll();
        }
      });
    }

    this.updateUI();
  }

  ensureDashboardMap() {
    const container = document.getElementById('dashboard-map');
    if (!container) return;

    if (!this.dashboardMap && window.L) {
      const center = this.selectedScenario?.center || [13.0827, 80.2707];
      this.dashboardMap = L.map('dashboard-map', {
        center: center,
        zoom: 10,
        zoomControl: false,
        attributionControl: false
      });

      const theme = document.body.getAttribute('data-theme') || 'dark';
      const tileUrl = theme === 'light'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(this.dashboardMap);
      this.dashMarkersLayer = L.layerGroup().addTo(this.dashboardMap);
    } else if (this.dashboardMap) {
      this.dashboardMap.invalidateSize();
      if (this.selectedScenario?.center) {
        this.dashboardMap.setView(this.selectedScenario.center, 10);
      }
    }

    if (this.dashboardMap && this.dashMarkersLayer) {
      this.dashMarkersLayer.clearLayers();
      const incidents = this.simulator?.incidents || [];
      incidents.forEach(inc => {
        const color = inc.severity >= 4 ? '#f43f5e' : (inc.severity >= 3 ? '#fbbf24' : '#38bdf8');
        const marker = L.circleMarker([inc.lat, inc.lng], {
          radius: 8,
          fillColor: color,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        });
        marker.bindTooltip(`🚨 ${inc.title} (L${inc.severity})`);
        marker.addTo(this.dashMarkersLayer);
      });
    }
  }

  selectIncident(id) {
    const inc = this.simulator.incidents.find(i => i.id === id);
    if (!inc) return;

    this.switchView('map');
    // switchView is async for map (uses requestAnimationFrame), wait for it
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (this.ui.map.map) {
          this.ui.map.setCenter([inc.lat, inc.lng], 13);
          const marker = this.ui.map.markers.get(id);
          if (marker) marker.openPopup();
        }
      });
    });
  }

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('open');
  }

  startClock() {
    const update = () => {
      const timeEl = document.getElementById('clock-time');
      const dateEl = document.getElementById('clock-date');
      const now    = new Date();
      if (timeEl) timeEl.textContent = window.DP.Helpers.formatTime(now);
      if (dateEl) dateEl.textContent = window.DP.Helpers.formatDateTime(now);
    };
    update();
    setInterval(update, 1000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.DP.App = new Application();
  window.DP.App.init();
});
