window.DP = window.DP || {};

window.DP.CompareManager = class {
  constructor() {
    this.simA = new window.DP.DataSimulator();
    this.simB = new window.DP.DataSimulator();
    this.active = false;
  }

  init() {
    this.simA.loadScenario(window.DP.Scenarios.HURRICANE);
    this.simB.loadScenario(window.DP.Scenarios.EARTHQUAKE);
    this.simA.start(3000);
    this.simB.start(3000);
    this.simA.on('tick', () => this._render('a', this.simA));
    this.simB.on('tick', () => this._render('b', this.simB));
    this._render('a', this.simA);
    this._render('b', this.simB);
  }

  loadScenarioA(key) {
    const sc = window.DP.Scenarios[key];
    if (sc) { this.simA.loadScenario(sc); this._render('a', this.simA); }
  }

  loadScenarioB(key) {
    const sc = window.DP.Scenarios[key];
    if (sc) { this.simB.loadScenario(sc); this._render('b', this.simB); }
  }

  _render(panel, sim) {
    const stats = sim.getStats();
    const kpisEl = document.getElementById(`compare-kpis-${panel}`);
    const incsEl = document.getElementById(`compare-incidents-${panel}`);
    if (!kpisEl || !incsEl) return;

    const kpis = [
      { label: 'Active Incidents', val: stats.active,    color: '#38bdf8' },
      { label: 'Population Affected', val: (stats.totalPop||0).toLocaleString(), color: '#818cf8' },
      { label: 'Resources Deployed', val: stats.deployed, color: '#10b981' },
      { label: 'Max Severity', val: `L${stats.maxSev}`, color: stats.maxSev >= 5 ? '#ff1744' : stats.maxSev >= 4 ? '#ff6d00' : '#ffd600' }
    ];

    kpisEl.innerHTML = kpis.map(k => `
      <div class="compare-kpi">
        <div class="compare-kpi-val" style="color:${k.color}">${k.val}</div>
        <div class="compare-kpi-lbl">${k.label}</div>
      </div>`).join('');

    const sorted = [...sim.incidents].sort((a,b) => (b.severity||0)-(a.severity||0)).slice(0, 8);
    const sevColors = ['#40c4ff','#00e676','#ffd600','#ff6d00','#ff1744'];
    incsEl.innerHTML = `
      <div class="compare-inc-title">Top Incidents</div>
      ${sorted.map(inc => `
        <div class="compare-inc-row">
          <span>${window.DP.CONSTANTS.DISASTER_TYPES[inc.type?.toUpperCase()]?.icon || '⚠️'}</span>
          <span class="compare-inc-name">${inc.title}</span>
          <span class="compare-inc-sev" style="color:${sevColors[inc.severity-1] || '#fff'}">L${inc.severity}</span>
        </div>`).join('')}`;
  }

  stop() {
    this.simA.stop();
    this.simB.stop();
  }
};
