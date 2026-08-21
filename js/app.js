window.DP = window.DP || {};

class Application {
  constructor() {
    this.ai = {
      bayesian:     new window.DP.BayesianThreatNetwork(),
      astar:        new window.DP.AStarRouter(50),
      kmeans:       new window.DP.KMeansClusterer(),
      decisionTree: new window.DP.SeverityClassifier(),
      monteCarlo:   new window.DP.MonteCarloPredictor(500)
    };

    this.simulator = new window.DP.DataSimulator();
    this.alerts    = new window.DP.AlertSystem();

    this.ui = {
      dashboard: new window.DP.DashboardComponent(),
      map:       new window.DP.MapManager(),
      resources: new window.DP.ResourceManager(),
      comms:     new window.DP.CommsLog(),
      charts:    new window.DP.ChartManager()
    };

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

    // Start Simulation Loop
    this.simulator.start(2500);

    // Clock
    this.startClock();
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
    });

    this.simulator.on('severityEscalation', (inc) => {
      this.alerts.escalation(inc);
    });
  }

  loadScenario(key) {
    const scenario = window.DP.Scenarios[key];
    if (!scenario) return;

    this.selectedScenario = scenario;
    this.simulator.loadScenario(scenario);

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

    // Show selected view — map and dashboard use flex, others use block
    const target = document.getElementById(`${viewId}-view`);
    if (target) {
      const flexViews = ['dashboard', 'map'];
      target.style.display = flexViews.includes(viewId) ? 'flex' : 'block';
    }

    // Map lazy-init: only create Leaflet when container is visible with real dimensions
    if (viewId === 'map') {
      // Wait one frame for the DOM to paint the visible container
      requestAnimationFrame(() => {
        this.ui.map.ensureInit();
        if (this.ui.map.map) {
          this.ui.map.map.invalidateSize();
          // Pan to current scenario
          this.ui.map.setCenter(this.selectedScenario.center, 10);
        }
        // Render map data after init
        this.ui.map.render({
          incidents: this.simulator.incidents,
          resources: this.simulator.resources,
          scenario:  this.selectedScenario,
          ai:        this.ai
        });
      });
      return; // updateUI called inside requestAnimationFrame above
    }

    this.updateUI();
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
