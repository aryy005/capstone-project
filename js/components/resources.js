window.DP = window.DP || {};

window.DP.ResourceManager = class {
  constructor() {
    this.container = document.getElementById('resources-view');
  }

  render(resources) {
    if (!this.container) return;

    const stats = this.getStats(resources);

    const html = `
      <div class="resource-summary-row">
        <div class="resource-summary-card">
          <span class="resource-summary-icon">🚑</span>
          <div class="resource-summary-info">
            <div class="resource-summary-count">${stats.deployed}/${stats.total}</div>
            <div class="resource-summary-label">Deployed Resources</div>
            <div class="resource-summary-bar progress-bar">
              <div class="progress-fill" style="width: ${stats.total > 0 ? (stats.deployed/stats.total)*100 : 0}%; background: var(--low);"></div>
            </div>
          </div>
        </div>

        <div class="resource-summary-card">
          <span class="resource-summary-icon">🚒</span>
          <div class="resource-summary-info">
            <div class="resource-summary-count">${stats.standby}</div>
            <div class="resource-summary-label">Standby Units</div>
            <div class="resource-summary-bar progress-bar">
              <div class="progress-fill" style="width: ${stats.total > 0 ? (stats.standby/stats.total)*100 : 0}%; background: var(--moderate);"></div>
            </div>
          </div>
        </div>

        <div class="resource-summary-card">
          <span class="resource-summary-icon">🚁</span>
          <div class="resource-summary-info">
            <div class="resource-summary-count">${stats.helicopters}</div>
            <div class="resource-summary-label">Air Support Active</div>
            <div class="resource-summary-bar progress-bar">
              <div class="progress-fill" style="width: 80%; background: var(--accent-primary);"></div>
            </div>
          </div>
        </div>

        <div class="resource-summary-card">
          <span class="resource-summary-icon">⛽</span>
          <div class="resource-summary-info">
            <div class="resource-summary-count">${stats.avgFuel}%</div>
            <div class="resource-summary-label">Avg Fuel / Battery</div>
            <div class="resource-summary-bar progress-bar">
              <div class="progress-fill" style="width: ${stats.avgFuel}%; background: ${stats.avgFuel < 30 ? 'var(--critical)' : 'var(--accent-tertiary)'};"></div>
            </div>
          </div>
        </div>
      </div>

      <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary); margin-bottom: 12px;">Active Resource Fleet (${resources.length})</h3>

      <div class="resource-grid">
        ${resources.map(r => this.renderResourceCard(r)).join('')}
      </div>
    `;

    this.container.innerHTML = html;
  }

  renderResourceCard(r) {
    const typeConfig = window.DP.CONSTANTS.RESOURCE_TYPES[r.type?.toUpperCase()] || { icon: '📦', label: r.type };
    const fuelPct = Math.round((r.fuel || 0.8) * 100);
    const isDeployed = r.status === 'DEPLOYED';

    return `
      <div class="resource-card ${isDeployed ? 'deployed' : 'standby'}">
        <div class="resource-card-header">
          <span class="resource-card-icon">${typeConfig.icon}</span>
          <span class="badge ${isDeployed ? 'badge-low' : 'badge-moderate'}">${r.status}</span>
        </div>
        <div class="resource-card-name">${r.name}</div>
        <div class="resource-card-type">${typeConfig.label}</div>
        <div class="fuel-bar-wrap">
          <div class="fuel-label">
            <span>Fuel / Power</span>
            <span>${fuelPct}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${fuelPct}%; background: ${fuelPct < 30 ? 'var(--critical)' : 'var(--accent-primary)'}"></div>
          </div>
        </div>
      </div>
    `;
  }

  getStats(resources) {
    const total = resources.length;
    const deployed = resources.filter(r => r.status === 'DEPLOYED').length;
    const standby = resources.filter(r => r.status === 'STANDBY').length;
    const helicopters = resources.filter(r => r.type === 'HELICOPTER').length;
    const totalFuel = resources.reduce((s, r) => s + (r.fuel || 0), 0);
    const avgFuel = total > 0 ? Math.round((totalFuel / total) * 100) : 0;

    return { total, deployed, standby, helicopters, avgFuel };
  }
};
