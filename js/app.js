window.DP = window.DP || {};

class Application {
  constructor() {
    this.ai = {
      bayesian: new window.DP.BayesianThreatNetwork(),
      astar: new window.DP.AStarRouter(50),
      kmeans: new window.DP.KMeansClusterer(),
      decisionTree: new window.DP.SeverityClassifier(),
      monteCarlo: new window.DP.MonteCarloPredictor(1000)
    };

    this.simulator = new window.DP.DataSimulator();
    this.alerts = new window.DP.AlertSystem();

    this.ui = {
      dashboard: new window.DP.DashboardComponent(),
      map: new window.DP.MapManager(),
      resources: new window.DP.ResourceManager(),
      comms: new window.DP.CommsLog(),
      charts: new window.DP.ChartManager()
    };

    this.currentView = 'dashboard';
    this.selectedScenario = window.DP.Scenarios.HURRICANE;
  }

  init() {
    console.log('⚡ Initializing AEGIS Disaster Management Platform...');

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
    document.querySelectorAll('.nav-item').forEach(item => {
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
    // 1. Bayesian Inference
    this.ai.bayesian.infer(this.simulator.weatherData);

    // 2. K-Means Clustering on active incident points
    const activePoints = this.simulator.incidents.map(i => ({
      lat: i.lat, lng: i.lng, severity: i.severity
    }));
    if (activePoints.length > 0) {
      this.ai.kmeans.cluster(activePoints, Math.min(3, activePoints.length));
    }

    // 3. A* Routing for evacuation
    if (this.selectedScenario.evacuationPoints && this.selectedScenario.safeZones) {
      const bounds = this.selectedScenario.bounds || { minLat: 10, maxLat: 35, minLng: 70, maxLng: 90 };
      this.ai.astar.generateEvacuationCorridors(
        this.selectedScenario.evacuationPoints,
        this.selectedScenario.safeZones,
        this.selectedScenario.hazardZones || [],
        bounds
      );
    }
  }

  updateUI() {
    const data = {
      simulator: this.simulator,
      ai: this.ai,
      scenario: this.selectedScenario,
      activeScenario: this.selectedScenario
    };

    // Render Active View
    if (this.currentView === 'dashboard') {
      this.ui.dashboard.render(data);
    } else if (this.currentView === 'map') {
      this.ui.map.render({
        incidents: this.simulator.incidents,
        resources: this.simulator.resources,
        scenario: this.selectedScenario,
        ai: this.ai
      });
    } else if (this.currentView === 'resources') {
      this.ui.resources.render(this.simulator.resources);
    } else if (this.currentView === 'comms') {
      this.ui.comms.render(this.simulator.commMessages);
    }

    // Update charts & global elements
    this.ui.charts.update(data);
  }

  switchView(viewId) {
    this.currentView = viewId;

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.view === viewId);
    });

    // Hide all view containers
    document.querySelectorAll('.view-container').forEach(el => {
      el.style.display = 'none';
    });

    // Show selected view
    const target = document.getElementById(`${viewId}-view`);
    if (target) {
      target.style.display = viewId === 'dashboard' ? 'flex' : 'block';
    }

    // Map resize fix when switching to map view
    if (viewId === 'map' && this.ui.map.map) {
      setTimeout(() => this.ui.map.map.invalidateSize(), 100);
    }

    this.updateUI();
  }

  selectIncident(id) {
    const inc = this.simulator.incidents.find(i => i.id === id);
    if (!inc) return;

    this.switchView('map');
    if (this.ui.map.map) {
      this.ui.map.setCenter([inc.lat, inc.lng], 13);
      const marker = this.ui.map.markers.get(id);
      if (marker) marker.openPopup();
    }
  }

  startClock() {
    const update = () => {
      const timeEl = document.getElementById('clock-time');
      const dateEl = document.getElementById('clock-date');
      const now = new Date();
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
