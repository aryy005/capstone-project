window.DP = window.DP || {};

window.DP.TimelineManager = class {
  constructor() {
    this.events = [];
    this.filter = 'all';
    this.maxEvents = 200;
  }

  addEvent(type, title, detail, severity = 1, icon = '🔔') {
    const event = {
      id: window.DP.Helpers.uid('evt'),
      type,      // 'incident' | 'escalation' | 'resolved' | 'scenario' | 'system'
      title,
      detail,
      severity,
      icon,
      timestamp: Date.now()
    };
    this.events.unshift(event);
    if (this.events.length > this.maxEvents) this.events.pop();
    this._renderEntry(event);
    return event;
  }

  setFilter(filter, btnEl) {
    this.filter = filter;
    document.querySelectorAll('#timeline-filters .filter-pill').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    this.renderAll();
  }

  renderAll() {
    const feed = document.getElementById('timeline-feed');
    if (!feed) return;
    const filtered = this.filter === 'all'
      ? this.events
      : this.events.filter(e => e.type === this.filter);
    feed.innerHTML = filtered.length === 0
      ? '<div class="timeline-empty">No events matching current filter.</div>'
      : filtered.map(e => this._buildEntryHTML(e)).join('');
  }

  _renderEntry(event) {
    const feed = document.getElementById('timeline-feed');
    if (!feed) return;
    if (this.filter !== 'all' && event.type !== this.filter) return;
    const html = this._buildEntryHTML(event);
    feed.insertAdjacentHTML('afterbegin', html);
    // Cap rendered entries
    const entries = feed.querySelectorAll('.timeline-entry');
    if (entries.length > 100) entries[entries.length - 1].remove();
  }

  _buildEntryHTML(event) {
    const sevColors = ['#40c4ff','#00e676','#ffd600','#ff6d00','#ff1744'];
    const sevColor = sevColors[(event.severity || 1) - 1] || '#40c4ff';
    const typeColors = {
      incident:   '#ff6d00',
      escalation: '#ff1744',
      resolved:   '#00e676',
      scenario:   '#818cf8',
      system:     '#38bdf8'
    };
    const lineColor = typeColors[event.type] || '#38bdf8';
    const timeStr = new Date(event.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

    return `
      <div class="timeline-entry" data-type="${event.type}">
        <div class="timeline-spine" style="--line-color: ${lineColor}"></div>
        <div class="timeline-dot" style="background: ${lineColor}; box-shadow: 0 0 8px ${lineColor};"></div>
        <div class="timeline-card">
          <div class="timeline-card-header">
            <span class="timeline-icon">${event.icon}</span>
            <span class="timeline-card-title">${event.title}</span>
            <span class="timeline-sev-badge" style="color:${sevColor}; border-color:${sevColor}">
              ${event.severity >= 1 ? 'L' + event.severity : ''}
            </span>
            <span class="timeline-time">${timeStr} · ${dateStr}</span>
          </div>
          <div class="timeline-card-detail">${event.detail}</div>
        </div>
      </div>`;
  }
};
