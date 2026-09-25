window.DP = window.DP || {};

window.DP.MapManager = class {
  constructor() {
    this.map = null;
    this.markers = new Map();
    this.resourceMarkers = new Map();
    this.routePolylines = [];
    this.hazardCircles = [];
    this.stagingMarkers = [];
    this.safeZoneMarkers = [];
    this.evacPointMarkers = [];
    this.heatmapLayer = null;
    this.monteCarloHeatmapLayer = null;
    this.is3DMode = false;
    this.cesiumViewer = null;
    this.layers = {
      incidents: true,
      resources: true,
      routes: true,
      hazards: true,
      staging: true,
      heatmap: false,
      monteCarlo: true,
      safeZones: true,
      evacuationPoints: true
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
    
    this._createLegend();
  }

  _createLegend() {
    if (!this.map) return;
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function(map) {
      const div = L.DomUtil.create('div', 'info legend');
      div.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      div.style.padding = '10px';
      div.style.borderRadius = '5px';
      div.style.color = 'white';
      div.style.fontSize = '12px';
      
      div.innerHTML = `
        <h4 style="margin: 0 0 5px 0">Map Legend</h4>
        <div style="margin-bottom: 3px"><span style="display:inline-block; width:12px; height:12px; background:#00e676; border-radius:50%; margin-right:5px;"></span>L1-L2 (Low)</div>
        <div style="margin-bottom: 3px"><span style="display:inline-block; width:12px; height:12px; background:#ffd600; border-radius:50%; margin-right:5px;"></span>L3 (Moderate)</div>
        <div style="margin-bottom: 3px"><span style="display:inline-block; width:12px; height:12px; background:#ff6d00; border-radius:50%; margin-right:5px;"></span>L4 (High)</div>
        <div style="margin-bottom: 3px"><span style="display:inline-block; width:12px; height:12px; background:#ff1744; border-radius:50%; margin-right:5px;"></span>L5 (Critical)</div>
        <hr style="border-color:#555; margin: 5px 0;">
        <div style="margin-bottom: 3px">📦 Resource</div>
        <div style="margin-bottom: 3px">⛺ Staging Area</div>
        <div style="margin-bottom: 3px">🛡️ Safe Zone</div>
        <div style="margin-bottom: 3px">📍 Evacuation Point</div>
        <hr style="border-color:#555; margin: 5px 0;">
        <div style="margin-bottom: 3px"><span style="display:inline-block; width:12px; height:12px; border:2px dashed #ff1744; border-radius:50%; margin-right:5px;"></span>Hazard Zone</div>
        <div style="margin-bottom: 3px"><span style="display:inline-block; width:12px; height:4px; background:#00e676; margin-right:5px;"></span>Evac Route</div>
      `;
      return div;
    };
    legend.addTo(this.map);
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
    this._pendingCenter = center;
    if (this.map) this.map.setView(center, zoom, { animate: true, duration: 1 });
    if (this.is3DMode && this.cesiumViewer && window.Cesium) {
      this.cesiumViewer.camera.flyTo({
        destination: window.Cesium.Cartesian3.fromDegrees(center[1], center[0], 25000)
      });
    }
  }

  toggle3DMode() {
    this.is3DMode = !this.is3DMode;
    const mapContainer = document.getElementById(this._containerId || 'map');
    const cesiumContainer = document.getElementById('cesiumContainer');
    const mapView = document.getElementById('map-view');
    const btn = document.getElementById('btn-toggle-3d');

    if (this.is3DMode) {
      if (btn) btn.innerHTML = '<span class="map-ctrl-icon">🗺️</span> Switch to 2D Flat Map';

      if (!this.cesiumViewer && window.Cesium) {
        try {
          // Disable Cesium Ion token requirement completely
          window.Cesium.Ion.defaultAccessToken = '';

          this.cesiumViewer = new window.Cesium.Viewer('cesiumContainer', {
            baseLayer: false,
            terrainProvider: undefined,
            baseLayerPicker: false,
            geocoder: false,
            homeButton: false,
            sceneModePicker: false,
            timeline: false,
            animation: false,
            fullscreenButton: false,
            navigationHelpButton: false,
            infoBox: false,
            selectionIndicator: false,
            creditContainer: document.createElement('div')
          });

          // Add free open CartoDB tile layer (no API key needed)
          const theme = document.body.getAttribute('data-theme') || 'dark';
          const tilePath = theme === 'light' ? 'rastertiles/voyager' : 'dark_all';
          const imageryProvider = new window.Cesium.UrlTemplateImageryProvider({
            url: `https://{s}.basemaps.cartocdn.com/${tilePath}/{z}/{x}/{y}.png`,
            subdomains: ['a', 'b', 'c', 'd'],
            maximumLevel: 18
          });
          this.cesiumViewer.imageryLayers.addImageryProvider(imageryProvider);
        } catch (err) {
          console.warn("Cesium 3D Globe fallback to CSS 3D perspective:", err);
          this.cesiumViewer = null;
        }
      }

      if (this.cesiumViewer && window.Cesium) {
        if (mapContainer) mapContainer.style.display = 'none';
        if (cesiumContainer) cesiumContainer.style.display = 'block';

        const center = this.map ? [this.map.getCenter().lat, this.map.getCenter().lng] : this._pendingCenter;
        if (center) {
          this.cesiumViewer.camera.flyTo({
            destination: window.Cesium.Cartesian3.fromDegrees(center[1], center[0], 35000),
            duration: 1.5
          });
        }
        
        // Add incident entities to 3D globe
        this.cesiumViewer.entities.removeAll();
        this.markers.forEach((marker, id) => {
          const latlng = marker.getLatLng();
          this.cesiumViewer.entities.add({
            position: window.Cesium.Cartesian3.fromDegrees(latlng.lng, latlng.lat),
            point: {
              pixelSize: 12,
              color: window.Cesium.Color.fromCssColorString('#ff1744'),
              outlineColor: window.Cesium.Color.WHITE,
              outlineWidth: 2
            }
          });
        });
      } else {
        // Fallback to CSS 3D perspective on Leaflet map if Cesium is unavailable
        if (mapView) mapView.classList.add('perspective-3d');
        if (mapContainer) mapContainer.style.display = 'block';
        if (cesiumContainer) cesiumContainer.style.display = 'none';
        if (this.map) setTimeout(() => this.map.invalidateSize(), 150);
      }
    } else {
      if (btn) btn.innerHTML = '<span class="map-ctrl-icon">🌐</span> Switch to 3D Tactical Perspective';
      if (mapView) mapView.classList.remove('perspective-3d');
      if (cesiumContainer) cesiumContainer.style.display = 'none';
      if (mapContainer) mapContainer.style.display = 'block';
      if (this.map) {
        setTimeout(() => this.map.invalidateSize(), 100);
      }
    }
  }

  render(data) {
    if (!this.map) return;
    const { incidents, resources, scenario, ai } = data;
    this._lastData = data; // Store data for toggling layers

    if (this.layers.incidents) this.renderIncidents(incidents);
    if (this.layers.resources) this.renderResources(resources);
    if (this.layers.hazards && scenario?.hazardZones) this.renderHazards(scenario.hazardZones);
    if (this.layers.routes && ai?.astar) this.renderEvacuationCorridors(ai.astar.routes);
    if (this.layers.staging && ai?.kmeans) this.renderStagingAreas(ai.kmeans.clusters);
    
    if (this.layers.safeZones && scenario?.safeZones) this.renderSafeZones(scenario.safeZones);
    if (this.layers.evacuationPoints && scenario?.evacuationPoints) this.renderEvacuationPoints(scenario.evacuationPoints);
    if (this.layers.monteCarlo && ai?.monteCarlo) this.renderMonteCarloOverlay(ai.monteCarlo, scenario);

    // Refresh heatmap if active
    if (this.layers.heatmap && this.heatmapLayer) {
      this.map.removeLayer(this.heatmapLayer);
      this.heatmapLayer = null;
      this.toggleHeatmap(incidents);
    }
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
        marker.setIcon(customIcon);
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

  renderSafeZones(safeZones) {
    this.clearSafeZones();
    if (!safeZones) return;

    safeZones.forEach(sz => {
      const icon = L.divIcon({
        className: 'safe-zone-wrap',
        html: `<div style="background:#00e676; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; color:white; border:2px solid white;">🛡️</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([sz.lat, sz.lng], { icon }).addTo(this.map);
      marker.bindTooltip(`Safe Zone: ${sz.name || 'Shelter'}`, { permanent: false });
      this.safeZoneMarkers.push(marker);
    });
  }

  renderEvacuationPoints(evacuationPoints) {
    this.clearEvacuationPoints();
    if (!evacuationPoints) return;

    evacuationPoints.forEach(ep => {
      const icon = L.divIcon({
        className: 'evac-point-wrap',
        html: `<div style="background:#ff6d00; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; color:white; border:2px solid white;">📍</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([ep.lat, ep.lng], { icon }).addTo(this.map);
      marker.bindTooltip(`Evacuation Point: ${ep.name || 'Pickup'}`, { permanent: false });
      this.evacPointMarkers.push(marker);
    });
  }

  renderMonteCarloOverlay(monteCarlo, scenario) {
    if (this.monteCarloHeatmapLayer) {
      this.map.removeLayer(this.monteCarloHeatmapLayer);
      this.monteCarloHeatmapLayer = null;
    }
    const results = monteCarlo?.results;
    if (!results || !results.heatmapPoints || !window.L.heatLayer) return;

    this.monteCarloHeatmapLayer = L.heatLayer(results.heatmapPoints, {
      radius: 40,
      blur: 25,
      maxZoom: 14,
      gradient: { 0.4: '#9c27b0', 0.6: '#e91e63', 0.8: '#ff5252', 1.0: '#b71c1c' }
    }).addTo(this.map);
  }

  toggleMonteCarloOverlay() {
    this.layers.monteCarlo = !this.layers.monteCarlo;
    const btn = document.getElementById('btn-toggle-mcoverlay');

    if (!this.layers.monteCarlo) {
      if (this.monteCarloHeatmapLayer) { this.map.removeLayer(this.monteCarloHeatmapLayer); this.monteCarloHeatmapLayer = null; }
      if (btn) { btn.classList.remove('active'); btn.style.background = ''; }
    } else {
      if (this._lastData?.ai?.monteCarlo) {
        this.renderMonteCarloOverlay(this._lastData.ai.monteCarlo, this._lastData.scenario);
      }
      if (btn) { btn.classList.add('active'); btn.style.background = 'rgba(156,39,176,0.2)'; }
    }
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

  clearSafeZones() {
    this.safeZoneMarkers.forEach(m => this.map.removeLayer(m));
    this.safeZoneMarkers = [];
  }

  clearEvacuationPoints() {
    this.evacPointMarkers.forEach(m => this.map.removeLayer(m));
    this.evacPointMarkers = [];
  }

  toggleHeatmap(incidents) {
    this.layers.heatmap = !this.layers.heatmap;
    const btn = document.getElementById('btn-toggle-heatmap');

    if (!this.layers.heatmap) {
      if (this.heatmapLayer) { this.map.removeLayer(this.heatmapLayer); this.heatmapLayer = null; }
      if (btn) { btn.classList.remove('active'); btn.style.background = ''; }
      return;
    }

    if (!window.L.heatLayer) { console.warn('Leaflet.heat not loaded'); return; }
    const points = (incidents || []).map(inc => [
      inc.lat, inc.lng, (inc.severity || 1) / 5
    ]);
    this.heatmapLayer = L.heatLayer(points, {
      radius: 35, blur: 20, maxZoom: 14,
      gradient: { 0.2: '#00e676', 0.5: '#ffd600', 0.8: '#ff6d00', 1.0: '#ff1744' }
    }).addTo(this.map);
    if (btn) { btn.classList.add('active'); btn.style.background = 'rgba(255,23,68,0.2)'; }
  }

  toggleLayer(layerName, state) {
    this.layers[layerName] = state !== undefined ? state : !this.layers[layerName];
    
    // Toggle button state visually
    const buttons = document.querySelectorAll('.layer-btn, button');
    buttons.forEach(btn => {
      if (btn.dataset.layer === layerName || (btn.onclick && btn.onclick.toString().includes(`'${layerName}'`)) || (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${layerName}'`))) {
        if (this.layers[layerName]) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });

    // Re-render or clear depending on state
    if (!this.layers[layerName]) {
      if (layerName === 'hazards') this.clearHazards();
      if (layerName === 'routes') this.clearRoutes();
      if (layerName === 'staging') this.clearStaging();
      if (layerName === 'safeZones') this.clearSafeZones();
      if (layerName === 'evacuationPoints') this.clearEvacuationPoints();
      if (layerName === 'monteCarlo' && this.monteCarloHeatmapLayer) {
        this.map.removeLayer(this.monteCarloHeatmapLayer);
        this.monteCarloHeatmapLayer = null;
      }
    } else {
      if (this._lastData) {
        this.render(this._lastData);
      }
    }
  }
};
