window.DP = window.DP || {};

window.DP.Helpers = {
  // Haversine formula - distance between two lat/lng points in km
  haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = Math.sin(dLat/2)*Math.sin(dLat/2) +
              Math.cos(this.toRad(lat1))*Math.cos(this.toRad(lat2))*
              Math.sin(dLng/2)*Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  },

  toRad(deg) { return deg * Math.PI / 180; },

  // Animate a number counter
  animateCounter(el, from, to, duration = 800, suffix = '') {
    const start = performance.now();
    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(from + (to - from) * ease).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  },

  // Format timestamp
  formatTime(date = new Date()) {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  },

  formatDateTime(date = new Date()) {
    return date.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  },

  timeAgo(date) {
    const secs = Math.floor((Date.now() - date) / 1000);
    if (secs < 60) return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs/60)}m ago`;
    return `${Math.floor(secs/3600)}h ago`;
  },

  // Random helpers
  rand(min, max) { return Math.random() * (max - min) + min; },
  randInt(min, max) { return Math.floor(this.rand(min, max + 1)); },
  randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  randGaussian(mean = 0, std = 1) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return mean + std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  },

  // Color interpolation for severity heatmaps
  lerpColor(c1, c2, t) {
    const hex = c => parseInt(c.slice(1), 16);
    const r1 = (hex(c1) >> 16) & 0xff, g1 = (hex(c1) >> 8) & 0xff, b1 = hex(c1) & 0xff;
    const r2 = (hex(c2) >> 16) & 0xff, g2 = (hex(c2) >> 8) & 0xff, b2 = hex(c2) & 0xff;
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return `rgb(${r},${g},${b})`;
  },

  // Severity color by 0-1 value
  severityColor(value) {
    if (value < 0.2) return '#00e676';
    if (value < 0.4) return '#40c4ff';
    if (value < 0.6) return '#ffd600';
    if (value < 0.8) return '#ff6d00';
    return '#ff1744';
  },

  // Debounce
  debounce(fn, delay) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
  },

  // Throttle
  throttle(fn, limit) {
    let inThrottle;
    return (...args) => { if (!inThrottle) { fn(...args); inThrottle = true; setTimeout(() => inThrottle = false, limit); } };
  },

  // Generate unique ID
  uid(prefix = 'id') { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; },

  // Clamp value
  clamp(val, min, max) { return Math.max(min, Math.min(max, val)); },

  // Generate random lat/lng near a center point
  randomLatLng(centerLat, centerLng, radiusKm) {
    const r = radiusKm / 111;
    const lat = centerLat + this.rand(-r, r);
    const lng = centerLng + this.rand(-r * 1.5, r * 1.5);
    return [lat, lng];
  },

  // Capitalize first letter
  capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(); },

  // Format large numbers
  formatNumber(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toString();
  },

  // Deep clone
  deepClone(obj) { return JSON.parse(JSON.stringify(obj)); },

  // Shuffle array
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  // Export NDRF CAP v1.2 Standard Alert JSON
  exportNDRFCAPReport(scenario, incident) {
    const activeScen = scenario || window.DP.App?.selectedScenario || { name: 'Emergency Operation' };
    const inc = incident || window.DP.App?.simulator?.incidents?.[0] || { id: 'INC_001', title: 'Primary Emergency' };

    const capPayload = {
      "$schema": "OASIS Common Alerting Protocol v1.2 (CAP-IN NDRF Spec)",
      "identifier": `NDRF-IN-${Date.now()}`,
      "sender": "SENTINEL.AI.DISASTER.PLATFORM",
      "sent": new Date().toISOString(),
      "status": "Actual",
      "msgType": "Alert",
      "scope": "Public",
      "info": {
        "category": "Safety",
        "event": inc.title || activeScen.name,
        "urgency": inc.severity >= 4 ? "Immediate" : "Expected",
        "severity": inc.severity >= 5 ? "Extreme" : (inc.severity >= 4 ? "Severe" : "Moderate"),
        "certainty": "Observed",
        "eventCode": { "valueName": "NDRF_CODE", "value": inc.type?.toUpperCase() || "DISASTER" },
        "expires": new Date(Date.now() + 86400000).toISOString(),
        "headline": `NDRF Priority Alert: ${inc.title || activeScen.name}`,
        "description": `AI Emergency Operations Command dispatch for ${activeScen.name}. Population affected: ${(inc.populationAffected || 10000).toLocaleString()}. Responders assigned: ${inc.responders || 5}.`,
        "instruction": "NDRF battalion units report to pre-positioned A* evacuation corridors immediately.",
        "area": {
          "areaDesc": activeScen.name,
          "circle": `${inc.lat || activeScen.center?.[0] || 20.5},${inc.lng || activeScen.center?.[1] || 78.9},5000`
        }
      }
    };

    const blob = new Blob([JSON.stringify(capPayload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `NDRF_CAP_ALERT_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
