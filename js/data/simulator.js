window.DP = window.DP || {};

/**
 * DataSimulator
 * Generates realistic real-time data streams for the platform
 * Simulates: weather, seismic, incidents, resource telemetry
 */
window.DP.DataSimulator = class {
  constructor() {
    this.activeScenario = null;
    this.incidents = [];
    this.resources = [];
    this.weatherData = {};
    this.seismicData = [];
    this.commMessages = [];
    this.tickCount = 0;
    this.listeners = {};
    this.tickInterval = null;
    this.resourceNames = [
      'Alpha-1','Alpha-2','Bravo-1','Bravo-2','Charlie-1','Charlie-2',
      'Delta-1','Delta-2','Eagle-1','Eagle-2','Falcon-1','Foxtrot-1',
      'Golf-1','Hotel-1','India-1','Juliet-1','Kilo-1','Lima-1'
    ];
    this.communicationTemplates = {
      dispatch: [
        'Unit {unit} dispatched to incident at {location}',
        '{unit} en route — ETA {eta} minutes',
        'Command: All units maintain radio silence on Channel 2',
        '{unit} reports road blocked at {location} — requesting alternate route',
        'Air support {unit} deployed — aerial assessment in progress'
      ],
      field: [
        '{unit}: Survivors located at {location}, requesting medical support',
        '{unit}: Structural integrity compromised — area secured',
        '{unit}: Triage complete — {count} casualties, {critical} critical',
        '{unit}: Supply drop needed at GPS {lat}, {lng}',
        '{unit}: Hazard zone expanded — pushing perimeter back 500m'
      ],
      command: [
        'Command: Incident severity upgraded to Level {level}',
        'ICS Update: Resource pool at {pct}% capacity',
        'Weather update: Conditions deteriorating — wind speed {ws} km/h',
        'Command: Requesting additional units from neighbouring districts',
        'Situation Report: {count} incidents active, {resolved} resolved'
      ]
    };
  }

  on(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  off(event, fn) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(f => f !== fn);
  }

  emit(event, data) {
    (this.listeners[event] || []).forEach(fn => fn(data));
  }

  loadScenario(scenario) {
    this.activeScenario = scenario;
    this.incidents = scenario.incidents.map(inc => ({
      ...inc,
      status: 'ACTIVE',
      timestamp: Date.now() - window.DP.Helpers.randInt(0, 7200000),
      responders: window.DP.Helpers.randInt(2, 15),
      updatedAt: Date.now(),
      classification: window.DP.App?.ai?.decisionTree?.classify(inc) || { severityLabel: 'HIGH', protocol: 'Full Response' }
    }));
    this.resources = this._generateResources(scenario.resources, scenario.center, scenario);
    this.weatherData = { ...scenario.weatherParams };
    this._generateInitialComms(scenario);
    this.emit('scenarioLoaded', { scenario, incidents: this.incidents, resources: this.resources });

    // Fetch real live weather from Open-Meteo API for scenario coordinates
    if (scenario.center) {
      this.fetchLiveWeather(scenario.center[0], scenario.center[1]);
    }
  }

  async fetchLiveWeather(lat, lng) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      const current = data.current;
      if (current) {
        this.weatherData = {
          windSpeed:        window.DP.Helpers.clamp((current.wind_speed_10m || 20) / 100, 0.1, 1),
          rainfall:         window.DP.Helpers.clamp((current.rain || 10) / 100, 0.1, 1),
          seismicActivity:  this.weatherData.seismicActivity || 0.1,
          temperature:      window.DP.Helpers.clamp((current.temperature_2m || 25) / 50, 0.1, 1),
          humidity:         window.DP.Helpers.clamp((current.relative_humidity_2m || 70) / 100, 0.1, 1),
          incidentReports:  this.weatherData.incidentReports || 0.5,
          isLiveAPI: true
        };
        this.emit('weatherUpdated', this.weatherData);
      }
    } catch (e) {
      console.warn('Live Weather API fallback to simulated telemetry:', e.message);
    }
  }

  _generateResources(counts, center, scenario) {
    const resources = [];
    const types = window.DP.CONSTANTS.RESOURCE_TYPES;
    let nameIdx = 0;

    const landBounds = scenario?.landBounds || {
      minLat: center[0] - 0.15, maxLat: center[0] + 0.15,
      minLng: center[1] - 0.15, maxLng: center[1] + 0.15
    };

    // Designated land staging bases & emergency road depots
    const bases = scenario?.stagingBases || [
      { name: 'District Emergency Command', lat: center[0], lng: center[1] },
      { name: 'Regional Medical Depot', lat: center[0] - 0.03, lng: center[1] - 0.02 },
      { name: 'Fire & Rescue Sector Base', lat: center[0] + 0.03, lng: center[1] - 0.03 }
    ];

    // Tactical active field deployment quotas for the map
    const maxDeployedByType = {
      AMBULANCE: 6,
      FIRE_ENGINE: 4,
      RESCUE_TEAM: 5,
      HELICOPTER: 2,
      MEDICAL_UNIT: 2,
      SUPPLY_TRUCK: 3
    };

    const addResources = (type, count) => {
      const maxDeployed = maxDeployedByType[type] || 2;
      let deployedCount = 0;

      for (let i = 0; i < count; i++) {
        const isDeployed = deployedCount < maxDeployed;
        if (isDeployed) deployedCount++;

        let lat, lng;
        if (isDeployed && scenario?.incidents?.length > 0) {
          // Deployed units are positioned realistically on land near active incidents or safe routes
          const targetInc = scenario.incidents[i % scenario.incidents.length];
          lat = targetInc.lat + window.DP.Helpers.rand(-0.012, 0.012);
          lng = targetInc.lng + window.DP.Helpers.rand(-0.022, -0.006); // strictly inland
        } else {
          // Standby units are stationed at legitimate emergency bases & depots on land
          const base = bases[i % bases.length];
          lat = base.lat + window.DP.Helpers.rand(-0.007, 0.007);
          lng = base.lng + window.DP.Helpers.rand(-0.007, 0.007);
        }

        // Strict clamp to land bounds (guarantees zero ocean coordinates)
        lat = window.DP.Helpers.clamp(lat, landBounds.minLat, landBounds.maxLat);
        lng = window.DP.Helpers.clamp(lng, landBounds.minLng, landBounds.maxLng);

        resources.push({
          id: window.DP.Helpers.uid('res'),
          type,
          name: this.resourceNames[nameIdx++ % this.resourceNames.length] + '-' + type.slice(0,2).toUpperCase(),
          lat, lng,
          status: isDeployed ? 'DEPLOYED' : 'STANDBY',
          fuel: window.DP.Helpers.rand(0.70, 1.0),
          capacity: types[type.toUpperCase().replace(/_/g, '_')]?.capacity || 4,
          assignedTo: isDeployed && scenario?.incidents ? scenario.incidents[i % scenario.incidents.length].id : null,
          lastUpdate: Date.now()
        });
      }
    };

    if (counts.ambulances)   addResources('AMBULANCE', counts.ambulances);
    if (counts.fireEngines)  addResources('FIRE_ENGINE', counts.fireEngines);
    if (counts.rescueTeams)  addResources('RESCUE_TEAM', counts.rescueTeams);
    if (counts.helicopters)  addResources('HELICOPTER', counts.helicopters);
    if (counts.medicalUnits) addResources('MEDICAL_UNIT', counts.medicalUnits);
    if (counts.supplyTrucks) addResources('SUPPLY_TRUCK', counts.supplyTrucks);
    return resources;
  }

  _generateInitialComms(scenario) {
    const messages = [
      { type: 'command', priority: 'HIGH',     text: `${scenario.name} — Emergency Declaration activated. All units on standby.`, time: Date.now() - 600000 },
      { type: 'command', priority: 'CRITICAL', text: `Incident Command established. Frequency: Channel 1 Primary, Channel 3 Backup.`, time: Date.now() - 500000 },
      { type: 'dispatch', priority: 'HIGH',    text: `All available units: Report to staging area immediately. Briefing in 10 minutes.`, time: Date.now() - 400000 },
      { type: 'field',    priority: 'MODERATE', text: `Alpha-1: On scene at primary incident. Requesting additional medical support.`, time: Date.now() - 300000 },
      { type: 'field',    priority: 'HIGH',     text: `Bravo-2: Road NH-7 blocked by debris — using alternate route via Ring Road.`, time: Date.now() - 200000 },
      { type: 'command',  priority: 'MODERATE', text: `Weather update: Conditions expected to worsen in next 2 hours.`, time: Date.now() - 100000 }
    ];
    this.commMessages = messages;
  }

  start(intervalMs = 2500) {
    if (this.tickInterval) clearInterval(this.tickInterval);
    this.tickInterval = setInterval(() => this._tick(), intervalMs);
  }

  stop() {
    if (this.tickInterval) { clearInterval(this.tickInterval); this.tickInterval = null; }
  }

  _tick() {
    this.tickCount++;
    const updates = {};

    // Update weather
    updates.weather = this._updateWeather();

    // Update seismic
    if (this.tickCount % 3 === 0) updates.seismic = this._generateSeismicEvent();

    // Update incident (random update)
    if (this.tickCount % 4 === 0 && this.incidents.length > 0) {
      updates.incident = this._updateRandomIncident();
    }

    // Occasionally add new incident
    if (this.tickCount % 12 === 0 && this.incidents.length < 15) {
      updates.newIncident = this._generateNewIncident();
      if (updates.newIncident) {
        this.incidents.push(updates.newIncident);
        this.emit('newIncident', updates.newIncident);
      }
    }

    // Occasionally resolve an incident
    if (this.tickCount % 20 === 0) {
      const active = this.incidents.filter(i => i.status === 'ACTIVE');
      if (active.length > 2) {
        const toResolve = window.DP.Helpers.randChoice(active);
        toResolve.status = 'CONTAINED';
        updates.resolvedIncident = toResolve;
        this.emit('incidentResolved', toResolve);
      }
    }

    // Generate comms message
    if (this.tickCount % 5 === 0) {
      updates.commMessage = this._generateCommMessage();
      this.commMessages.unshift(updates.commMessage);
      if (this.commMessages.length > 100) this.commMessages.pop();
      this.emit('newComm', updates.commMessage);
    }

    // Update resource positions slightly
    if (this.tickCount % 6 === 0) {
      this._updateResourcePositions();
    }

    updates.stats = this.getStats();
    this.emit('tick', updates);
  }

  _updateWeather() {
    const fluctuate = (val, noise = 0.03) =>
      window.DP.Helpers.clamp(val + window.DP.Helpers.rand(-noise, noise), 0, 1);

    this.weatherData = {
      windSpeed:        fluctuate(this.weatherData.windSpeed || 0.5, 0.04),
      rainfall:         fluctuate(this.weatherData.rainfall  || 0.3, 0.03),
      seismicActivity:  fluctuate(this.weatherData.seismicActivity || 0.1, 0.02),
      temperature:      fluctuate(this.weatherData.temperature || 0.5, 0.02),
      humidity:         fluctuate(this.weatherData.humidity || 0.5, 0.03),
      incidentReports:  fluctuate(this.weatherData.incidentReports || 0.4, 0.05)
    };
    return this.weatherData;
  }

  _generateSeismicEvent() {
    const event = {
      id: window.DP.Helpers.uid('seis'),
      magnitude: window.DP.Helpers.rand(1.0, 4.5),
      depth: window.DP.Helpers.randInt(5, 40),
      timestamp: Date.now(),
      lat: this.activeScenario ? this.activeScenario.center[0] + window.DP.Helpers.rand(-1, 1) : 20 + window.DP.Helpers.rand(-5, 5),
      lng: this.activeScenario ? this.activeScenario.center[1] + window.DP.Helpers.rand(-1, 1) : 78 + window.DP.Helpers.rand(-5, 5)
    };
    this.seismicData.push(event);
    if (this.seismicData.length > 50) this.seismicData.shift();
    return event;
  }

  _updateRandomIncident() {
    const active = this.incidents.filter(i => i.status === 'ACTIVE');
    if (active.length === 0) return null;
    const inc = window.DP.Helpers.randChoice(active);
    inc.responders = window.DP.Helpers.clamp(inc.responders + window.DP.Helpers.randInt(-1, 2), 0, 30);
    inc.updatedAt = Date.now();
    // Small chance of severity escalation
    if (Math.random() < 0.05 && inc.severity < 5) {
      inc.severity++;
      this.emit('severityEscalation', inc);
    }
    return inc;
  }

  _generateNewIncident() {
    if (!this.activeScenario) return null;
    const center = this.activeScenario.center;
    const bounds = this.activeScenario.landBounds;
    let lat, lng;
    if (bounds) {
      lat = window.DP.Helpers.rand(bounds.minLat + 0.02, bounds.maxLat - 0.02);
      lng = window.DP.Helpers.rand(bounds.minLng + 0.02, bounds.maxLng - 0.02);
    } else {
      [lat, lng] = window.DP.Helpers.randomLatLng(center[0], center[1], 15);
    }
    const types = Object.keys(window.DP.CONSTANTS.DISASTER_TYPES);
    const disasterType = this.activeScenario.disasterType || window.DP.Helpers.randChoice(types).toLowerCase();
    const severity = window.DP.Helpers.randInt(1, 4);
    const inc = {
      id: window.DP.Helpers.uid('inc'),
      type: disasterType,
      title: `New ${window.DP.Helpers.capitalize(disasterType)} Incident`,
      lat, lng,
      severity,
      populationAffected: window.DP.Helpers.randInt(100, 10000),
      magnitude: window.DP.Helpers.rand(2, 7),
      infrastructureDamage: window.DP.Helpers.rand(0.1, 0.7),
      weatherCondition: window.DP.Helpers.rand(0.2, 0.9),
      status: 'ACTIVE',
      responders: window.DP.Helpers.randInt(1, 8),
      timestamp: Date.now(),
      updatedAt: Date.now()
    };
    inc.classification = window.DP.App?.ai?.decisionTree ? window.DP.App.ai.decisionTree.classify(inc) : { severityLabel: 'MODERATE' };
    return inc;
  }

  _generateCommMessage() {
    const types = ['dispatch', 'field', 'command'];
    const type = window.DP.Helpers.randChoice(types);
    const templates = this.communicationTemplates[type];
    let text = window.DP.Helpers.randChoice(templates);

    const unit = window.DP.Helpers.randChoice(this.resourceNames);
    const incidentsList = (this.activeScenario?.incidents?.length > 0) ? this.activeScenario.incidents : [{ title: 'Incident Zone' }];
    const location = this.activeScenario
      ? window.DP.Helpers.randChoice(incidentsList).title
      : 'Sector 7';
    text = text
      .replace('{unit}', unit)
      .replace('{location}', location)
      .replace('{eta}', window.DP.Helpers.randInt(5, 30))
      .replace('{count}', window.DP.Helpers.randInt(3, 25))
      .replace('{critical}', window.DP.Helpers.randInt(1, 8))
      .replace('{level}', window.DP.Helpers.randInt(3, 5))
      .replace('{pct}', window.DP.Helpers.randInt(55, 95))
      .replace('{ws}', window.DP.Helpers.randInt(40, 120))
      .replace('{lat}', (this.activeScenario?.center[0] || 20).toFixed(4))
      .replace('{lng}', (this.activeScenario?.center[1] || 78).toFixed(4))
      .replace('{resolved}', window.DP.Helpers.randInt(0, 5));

    const priorities = { command: 'HIGH', dispatch: 'MODERATE', field: window.DP.Helpers.randChoice(['LOW', 'MODERATE', 'HIGH']) };
    return { id: window.DP.Helpers.uid('msg'), type, priority: priorities[type], text, time: Date.now() };
  }

  _updateResourcePositions() {
    const bounds = this.activeScenario?.landBounds;
    this.resources.forEach(res => {
      if (res.status === 'DEPLOYED') {
        res.lat += window.DP.Helpers.rand(-0.002, 0.002);
        res.lng += window.DP.Helpers.rand(-0.002, 0.002);
        if (bounds) {
          res.lat = window.DP.Helpers.clamp(res.lat, bounds.minLat, bounds.maxLat);
          res.lng = window.DP.Helpers.clamp(res.lng, bounds.minLng, bounds.maxLng);
        }
        res.fuel = Math.max(0.05, res.fuel - window.DP.Helpers.rand(0, 0.002));
        res.lastUpdate = Date.now();
      }
    });
  }

  getStats() {
    const active   = this.incidents.filter(i => i.status === 'ACTIVE').length;
    const contained = this.incidents.filter(i => i.status === 'CONTAINED').length;
    const deployed  = this.resources.filter(r => r.status === 'DEPLOYED').length;
    const standby   = this.resources.filter(r => r.status === 'STANDBY').length;
    const totalPop  = this.incidents.reduce((s, i) => s + (i.populationAffected || 0), 0);
    const maxSev    = Math.max(...this.incidents.map(i => i.severity || 1), 1);
    return { active, contained, deployed, standby, totalPop, maxSev, totalIncidents: this.incidents.length, totalResources: this.resources.length };
  }
};
