window.DP = window.DP || {};

window.DP.MapManager = class {
  constructor() {
    this.map = null;
    this.markers = new Map();
    this.resourceMarkers = new Map();
    this.routePolylines = [];
    this.hazardCircles = [];
    this.stagingMarkers = [];
    this.heatmapLayer = null;
    this.layers = {
      incidents: true,
      resources: true,
      routes: true,
      hazards: true,
      staging: true,
      heatmap: false
    };
  }

  init(containerId = 'map', center = window.DP.CONSTANTS.MAP.DEFAULT_CENTER, zoom = window.DP.CONSTANTS.MAP.DEFAULT_ZOOM) {
    // Store params for lazy init — Leaflet MUST be initialized when container is visible
    this._pendingCenter = center;
    this._pendingZoom   = zoom;
    this._containerId   = containerId;
    // Don't call L.map() here — container is hidden (display:none) so Leaflet gets 0 height
  }

  // Called the first time the map view becomes visible
  ensureInit() {
    if (this.map) return;
    const containerId = this._containerId || 'map';
    const center      = this._pendingCenter || window.DP.CONSTANTS.MAP.DEFAULT_CENTER;
    const zoom        = this._pendingZoom   || window.DP.CONSTANTS.MAP.DEFAULT_ZOOM;

    this.map = L.map(containerId, {
      center,
      zoom,
      maxZoom: window.DP.CONSTANTS.MAP.MAX_ZOOM,
      zoomControl: true
    });

    const theme = document.body.getAttribute('data-theme') || 'dark';
    const tileUrl = theme === 'light'
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : window.DP.CONSTANTS.MAP.TILE_URL;

    this.tileLayer = L.tileLayer(tileUrl, {
      attribution: window.DP.CONSTANTS.MAP.TILE_ATTRIBUTION,
      maxZoom:     window.DP.CONSTANTS.MAP.MAX_ZOOM
    }).addTo(this.map);
  }

  setThemeTile(theme) {
    if (!this.map) return;
    if (this.tileLayer) {
      this.map.removeLayer(this.tileLayer);
    }
    const tileUrl = theme === 'light'
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : window.DP.CONSTANTS.MAP.TILE_URL;

    this.tileLayer = L.tileLayer(tileUrl, {
      attribution: window.DP.CONSTANTS.MAP.TILE_ATTRIBUTION,
      maxZoom:     window.DP.CONSTANTS.MAP.MAX_ZOOM
    }).addTo(this.map);
  }

  setCenter(center, zoom = 11) {
    if (this.map) this.map.setView(center, zoom, { animate: true, duration: 1 });
  }

  render(data) {
    if (!this.map) return;
    const { incidents, resources, scenario, ai } = data;

    if (this.layers.incidents) this.renderIncidents(incidents);
    if (this.layers.resources) this.renderResources(resources);
    if (this.layers.hazards && scenario?.hazardZones) this.renderHazards(scenario.hazardZones);
    if (this.layers.routes && ai?.astar) this.renderEvacuationCorridors(ai.astar.routes);
    if (this.layers.staging && ai?.kmeans) this.renderStagingAreas(ai.kmeans.clusters);
  }

  renderIncidents(incidents) {
    // Remove obsolete markers
    const currentIds = new Set(incidents.map(i => i.id));
    this.markers.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        this.map.removeLayer(marker);
        this.markers.delete(id);
      }
    });

    // Add or update markers
    incidents.forEach(inc => {
      const color = window.DP.Helpers.severityColor((inc.severity || 1) / 5);
      const iconText = window.DP.CONSTANTS.DISASTER_TYPES[inc.type?.toUpperCase()]?.icon || '⚠️';
      const pulseClass = inc.severity >= 5 ? 'pulse-critical' : inc.severity >= 4 ? 'pulse-high' : '';

      const customIcon = L.divIcon({
        className: 'custom-marker-wrap',
        html: `
          <div class="custom-marker ${pulseClass}" style="background:${color}; width:32px; height:32px; color:#fff;">
            ${iconText}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      if (this.markers.has(inc.id)) {
        const marker = this.markers.get(inc.id);
        marker.setLatLng([inc.lat, inc.lng]);
      } else {
        const marker = L.marker([inc.lat, inc.lng], { icon: customIcon }).addTo(this.map);
        
        const popupContent = `
          <div class="incident-popup">
            <div class="incident-popup-header">
              <span>${iconText}</span>
              <div class="incident-popup-title">${inc.title}</div>
            </div>
            <div class="badge badge-${(window.DP.CONSTANTS.THREAT_LEVELS[(inc.severity||1)-1] || 'LOW').toLowerCase()}">
              Severity Level ${inc.severity}
            </div>
            <div class="incident-popup-grid">
              <div class="incident-popup-item">
                <div class="incident-popup-item-label">Affected</div>
                <div class="incident-popup-item-value">👥 ${(inc.populationAffected||0).toLocaleString()}</div>
              </div>
              <div class="incident-popup-item">
                <div class="incident-popup-item-label">Responders</div>
                <div class="incident-popup-item-value">🚓 ${inc.responders||0}</div>
              </div>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);
        this.markers.set(inc.id, marker);
      }
    });
  }

  renderResources(resources) {
    const currentIds = new Set(resources.map(r => r.id));
    this.resourceMarkers.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        this.map.removeLayer(marker);
        this.resourceMarkers.delete(id);
      }
    });

    resources.forEach(res => {
      const typeConfig = window.DP.CONSTANTS.RESOURCE_TYPES[res.type?.toUpperCase()] || { icon: '📦' };
      const statusClass = res.status.toLowerCase();

      const iconHtml = L.divIcon({
        className: 'resource-marker-wrap',
        html: `<div class="resource-marker ${statusClass}">${typeConfig.icon}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      if (this.resourceMarkers.has(res.id)) {
        this.resourceMarkers.get(res.id).setLatLng([res.lat, res.lng]);
      } else {
        const marker = L.marker([res.lat, res.lng], { icon: iconHtml }).addTo(this.map);
        marker.bindPopup(`<strong>${res.name}</strong><br>Type: ${res.type}<br>Status: ${res.status}`);
        this.resourceMarkers.set(res.id, marker);
      }
    });
  }

  renderHazards(hazardZones) {
    this.clearHazards();
    hazardZones.forEach(hz => {
      const circle = L.circle([hz.lat, hz.lng], {
        radius: hz.radiusKm * 1000,
        color: '#ff1744',
        fillColor: '#ff1744',
        fillOpacity: 0.15 + (hz.severity || 0.5) * 0.2,
        weight: 2,
        dashArray: '5, 10'
      }).addTo(this.map);
      circle.bindTooltip(`Hazard Zone: ${hz.type || 'Danger'} (${hz.radiusKm} km)`, { permanent: false });
      this.hazardCircles.push(circle);
    });
  }

  renderEvacuationCorridors(routes) {
    this.clearRoutes();
    if (!routes) return;

    routes.forEach(r => {
      if (!r.path || r.path.length < 2) return;
      const polyline = L.polyline(r.path, {
        color: r.color || '#00e676',
        weight: 4,
        opacity: 0.8,
        dashArray: '8, 8'
      }).addTo(this.map);

      polyline.bindPopup(`
        <div class="route-popup">
          <h3>🟢 Evacuation Corridor</h3>
          <p>Distance: <strong>${r.distanceKm} km</strong></p>
          <p>Est. Travel Time: <strong>${r.estimatedMinutes} mins</strong></p>
        </div>
      `);

      this.routePolylines.push(polyline);
    });
  }

  renderStagingAreas(clusters) {
    this.clearStaging();
    if (!clusters) return;

    clusters.forEach(c => {
      if (!c.centroid) return;
      const icon = L.divIcon({
        className: 'staging-wrap',
        html: `<div class="staging-marker" style="width:36px; height:36px;">⛺ ${c.id+1}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([c.centroid.lat, c.centroid.lng], { icon }).addTo(this.map);
      marker.bindPopup(`
        <strong>AI Staging Hub ${c.id+1}</strong><br>
        Covering ${c.size} incidents<br>
        Rec. Ambulances: ${c.recommendedResources?.ambulances || 0}<br>
        Rec. Rescue Teams: ${c.recommendedResources?.rescueTeams || 0}
      `);
      this.stagingMarkers.push(marker);
    });
  }

  clearHazards() {
    this.hazardCircles.forEach(c => this.map.removeLayer(c));
    this.hazardCircles = [];
  }

  clearRoutes() {
    this.routePolylines.forEach(p => this.map.removeLayer(p));
    this.routePolylines = [];
  }

  clearStaging() {
    this.stagingMarkers.forEach(m => this.map.removeLayer(m));
    this.stagingMarkers = [];
  }

  toggleLayer(layerName, state) {
    this.layers[layerName] = state !== undefined ? state : !this.layers[layerName];
    if (!this.layers.hazards) this.clearHazards();
    if (!this.layers.routes) this.clearRoutes();
    if (!this.layers.staging) this.clearStaging();
  }
};
