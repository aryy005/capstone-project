window.DP = window.DP || {};

window.DP.CONSTANTS = {
  SEVERITY: {
    CRITICAL: { level: 5, label: 'CRITICAL', color: '#ff1744', bg: 'rgba(255,23,68,0.15)', icon: '🔴', pulse: true },
    HIGH:     { level: 4, label: 'HIGH',     color: '#ff6d00', bg: 'rgba(255,109,0,0.15)', icon: '🟠', pulse: true },
    MODERATE: { level: 3, label: 'MODERATE', color: '#ffd600', bg: 'rgba(255,214,0,0.15)', icon: '🟡', pulse: false },
    LOW:      { level: 2, label: 'LOW',      color: '#00e676', bg: 'rgba(0,230,118,0.15)', icon: '🟢', pulse: false },
    MINIMAL:  { level: 1, label: 'MINIMAL',  color: '#40c4ff', bg: 'rgba(64,196,255,0.15)', icon: '🔵', pulse: false }
  },

  DISASTER_TYPES: {
    HURRICANE:  { id: 'hurricane',  label: 'Hurricane',       icon: '🌀', color: '#7c4dff' },
    EARTHQUAKE: { id: 'earthquake', label: 'Earthquake',      icon: '🌋', color: '#ff6d00' },
    WILDFIRE:   { id: 'wildfire',   label: 'Wildfire',        icon: '🔥', color: '#ff1744' },
    FLOOD:      { id: 'flood',      label: 'Flash Flood',     icon: '🌊', color: '#00b0ff' },
    CHEMICAL:   { id: 'chemical',   label: 'Chemical Spill',  icon: '☣️', color: '#76ff03' },
    TSUNAMI:    { id: 'tsunami',    label: 'Tsunami',         icon: '🌊', color: '#18ffff' },
    TORNADO:    { id: 'tornado',    label: 'Tornado',         icon: '🌪️', color: '#e040fb' }
  },

  RESOURCE_TYPES: {
    AMBULANCE:    { id: 'ambulance',    label: 'Ambulance',          icon: '🚑', capacity: 2  },
    FIRE_ENGINE:  { id: 'fire_engine',  label: 'Fire Engine',        icon: '🚒', capacity: 6  },
    POLICE:       { id: 'police',       label: 'Police Unit',        icon: '🚓', capacity: 4  },
    HELICOPTER:   { id: 'helicopter',   label: 'Helicopter',         icon: '🚁', capacity: 8  },
    RESCUE_TEAM:  { id: 'rescue_team',  label: 'Rescue Team',        icon: '🦺', capacity: 12 },
    SUPPLY_TRUCK: { id: 'supply_truck', label: 'Supply Truck',       icon: '🚛', capacity: 0  },
    MEDICAL_UNIT: { id: 'medical_unit', label: 'Medical Unit',       icon: '⛑️', capacity: 20 },
    DRONE:        { id: 'drone',        label: 'Surveillance Drone', icon: '🛸', capacity: 0  }
  },

  STATUS: {
    ACTIVE:    { label: 'Active',    color: '#ff1744' },
    STANDBY:   { label: 'Standby',   color: '#ffd600' },
    DEPLOYED:  { label: 'Deployed',  color: '#00e676' },
    RESOLVED:  { label: 'Resolved',  color: '#40c4ff' },
    CONTAINED: { label: 'Contained', color: '#7c4dff' }
  },

  MAP: {
    DEFAULT_CENTER: [20.5937, 78.9629],
    DEFAULT_ZOOM: 5,
    TILE_URL: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    TILE_ATTRIBUTION: '&copy; <a href="https://carto.com/">CARTO</a>',
    MAX_ZOOM: 18
  },

  AI: {
    KMEANS_MAX_ITER: 100,
    KMEANS_TOLERANCE: 0.0001,
    MONTE_CARLO_RUNS: 1000,
    ASTAR_GRID_SIZE: 50,
    BAYESIAN_UPDATE_INTERVAL: 3000,
    SIMULATION_TICK: 2500
  },

  ALERT_PRIORITY: { CRITICAL: 4, HIGH: 3, MODERATE: 2, LOW: 1 },

  THREAT_LEVELS: ['MINIMAL', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL']
};
