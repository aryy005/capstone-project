window.DP = window.DP || {};

window.DP.AlertSystem = class {
  constructor() {
    this.container = document.getElementById('alert-container');
    this.modal = document.getElementById('critical-modal');
    this.queue = [];
    this.activeToasts = new Map();
    this.badgeEl = document.getElementById('alert-badge');
    this.alertCount = 0;
  }

  show(title, message, severity = 'LOW', icon = '🔔', duration = 5000) {
    this.alertCount++;
    if (this.badgeEl) this.badgeEl.textContent = this.alertCount;

    const colorMap = { CRITICAL: '#ff1744', HIGH: '#ff6d00', MODERATE: '#ffd600', LOW: '#40c4ff', INFO: '#00e676' };
    const color = colorMap[severity] || colorMap.LOW;
    const id = window.DP.Helpers.uid('toast');

    if (severity === 'CRITICAL') {
      this._showCriticalModal(title, message, icon);
      return;
    }

    const toast = document.createElement('div');
    toast.className = 'alert-toast animate-slideInRight';
    toast.id = id;
    toast.style.setProperty('--toast-color', color);
    toast.style.setProperty('--toast-duration', `${duration}ms`);
    toast.innerHTML = `
      <div class="toast-header">
        <span class="toast-icon">${icon}</span>
        <span class="toast-title">${title}</span>
        <button class="toast-close" onclick="window.DP.App.alerts.dismiss('${id}')">✕</button>
      </div>
      <div class="toast-body">${message}</div>
      <div class="toast-time">${window.DP.Helpers.formatTime()}</div>
    `;

    this.container.appendChild(toast);
    this.activeToasts.set(id, toast);

    // Limit visible toasts
    if (this.activeToasts.size > 5) {
      const oldest = this.activeToasts.keys().next().value;
      this.dismiss(oldest);
    }

    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id) {
    const toast = this.activeToasts.get(id);
    if (!toast) return;
    toast.classList.add('dismissing');
    setTimeout(() => { toast.remove(); this.activeToasts.delete(id); }, 300);
  }

  _showCriticalModal(title, message, icon) {
    const modal = this.modal;
    if (!modal) return;
    modal.querySelector('.critical-modal-icon').textContent = icon;
    modal.querySelector('.critical-modal-title').textContent = title;
    modal.querySelector('.critical-modal-body').textContent = message;
    modal.classList.add('visible');
  }

  closeCriticalModal() {
    if (this.modal) this.modal.classList.remove('visible');
  }

  // Specific alert types
  incident(inc) {
    const sev = inc.severity >= 5 ? 'CRITICAL' : inc.severity >= 4 ? 'HIGH' : inc.severity >= 3 ? 'MODERATE' : 'LOW';
    const icons = { hurricane:'🌀', earthquake:'🌋', wildfire:'🔥', flood:'🌊', chemical:'☣️' };
    const icon = icons[inc.type] || '⚠️';
    const msg = `${inc.title} — ${(inc.populationAffected||0).toLocaleString()} people affected. Severity Level ${inc.severity}.`;
    this.show(`New ${window.DP.Helpers.capitalize(inc.type||'Incident')} Incident`, msg, sev, icon, 6000);
  }

  escalation(inc) {
    this.show('⬆ Severity Escalation', `${inc.title} has escalated to Level ${inc.severity}`, 'HIGH', '🔺', 5000);
  }

  resourceLow(type, count) {
    this.show('Resource Alert', `${type} units critically low: only ${count} remaining`, 'MODERATE', '📦', 5000);
  }

  scenarioLoaded(name) {
    this.alertCount = 0;
    if (this.badgeEl) this.badgeEl.textContent = '';
    this.show('Scenario Activated', name, 'INFO', '🎯', 4000);
  }
};
