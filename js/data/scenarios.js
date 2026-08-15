window.DP = window.DP || {};

/**
 * Pre-built Disaster Scenarios for demonstration and training
 * Each scenario includes: location, incidents, resources, timeline events
 */
window.DP.Scenarios = {
  HURRICANE: {
    id: 'hurricane',
    name: 'Category 4 Hurricane — Bay of Bengal Landfall',
    icon: '🌀',
    color: '#7c4dff',
    disasterType: 'hurricane',
    center: [13.08, 80.27], // Chennai
    bounds: { minLat: 10.0, maxLat: 16.0, minLng: 77.0, maxLng: 83.5 },
    description: 'Category 4 hurricane making landfall on the southeast coast with 220 km/h winds.',
    severity: 5,
    affectedPopulation: 2400000,
    weatherParams: { windSpeed: 0.92, rainfall: 0.88, seismicActivity: 0.05, temperature: 0.65, humidity: 0.95, incidentReports: 0.85 },
    monteCarloParams: { windSpeed: 0.9, humidity: 0.95, windDir: 1.2, rainfall: 0.9 },
    incidents: [
      { id: 'h1', type: 'hurricane', title: 'Coastal Flooding — Besant Nagar', lat: 12.99, lng: 80.27, severity: 5, populationAffected: 45000, magnitude: 8.5, infrastructureDamage: 0.7, weatherCondition: 0.9 },
      { id: 'h2', type: 'hurricane', title: 'Building Collapse — T Nagar',     lat: 13.04, lng: 80.23, severity: 4, populationAffected: 12000, magnitude: 7.0, infrastructureDamage: 0.6, weatherCondition: 0.85 },
      { id: 'h3', type: 'hurricane', title: 'Storm Surge — Marina Beach',       lat: 13.05, lng: 80.28, severity: 5, populationAffected: 80000, magnitude: 9.0, infrastructureDamage: 0.8, weatherCondition: 0.95 },
      { id: 'h4', type: 'hurricane', title: 'Power Grid Failure — Adyar',       lat: 13.00, lng: 80.25, severity: 3, populationAffected: 320000, magnitude: 5.0, infrastructureDamage: 0.5, weatherCondition: 0.8 },
      { id: 'h5', type: 'hurricane', title: 'Road Blockage — ECR Highway',      lat: 12.85, lng: 80.22, severity: 3, populationAffected: 8000,  magnitude: 4.5, infrastructureDamage: 0.3, weatherCondition: 0.75 }
    ],
    evacuationPoints: [
      { lat: 12.99, lng: 80.27, name: 'Besant Nagar Zone A' },
      { lat: 13.05, lng: 80.28, name: 'Marina Beach Zone B' },
      { lat: 12.85, lng: 80.22, name: 'ECR Zone C' }
    ],
    safeZones: [
      { lat: 13.15, lng: 80.10, name: 'Anna University Relief Camp' },
      { lat: 13.20, lng: 80.15, name: 'IIT Madras Shelter' }
    ],
    hazardZones: [
      { lat: 13.00, lng: 80.28, radiusKm: 8, severity: 0.9, type: 'Storm Surge' },
      { lat: 12.99, lng: 80.27, radiusKm: 5, severity: 0.85, type: 'Flooding' }
    ],
    resources: { ambulances: 45, fireEngines: 30, rescueTeams: 20, helicopters: 8, medicalUnits: 15, supplyTrucks: 40 },
    timelineEvents: [
      { time: -72, event: 'Hurricane warning issued, evacuation advisory' },
      { time: -48, event: 'Mandatory evacuation order for coastal zones' },
      { time: -24, event: 'Emergency shelters activated, resource pre-positioning' },
      { time: 0,  event: 'Hurricane makes landfall — all units on full alert' },
      { time: 12, event: 'Search and rescue operations begin' },
      { time: 24, event: 'Power restoration teams deployed' }
    ]
  },

  EARTHQUAKE: {
    id: 'earthquake',
    name: 'M7.2 Earthquake — Himalayan Fault Zone',
    icon: '🌋',
    color: '#ff6d00',
    disasterType: 'earthquake',
    center: [30.73, 79.07], // Uttarakhand
    bounds: { minLat: 28.5, maxLat: 32.5, minLng: 76.5, maxLng: 81.5 },
    description: 'Major 7.2 magnitude earthquake along the Himalayan fault with multiple aftershocks expected.',
    severity: 5,
    affectedPopulation: 850000,
    weatherParams: { windSpeed: 0.2, rainfall: 0.15, seismicActivity: 0.98, temperature: 0.4, humidity: 0.3, incidentReports: 0.92 },
    monteCarloParams: { magnitude: 0.9, soilSoftness: 0.7 },
    incidents: [
      { id: 'e1', type: 'earthquake', title: 'Building Collapse — Dehradun Old City',  lat: 30.32, lng: 78.03, severity: 5, populationAffected: 25000, magnitude: 9.5, infrastructureDamage: 0.9, weatherCondition: 0.1 },
      { id: 'e2', type: 'earthquake', title: 'Landslide Blocking NH-58',               lat: 30.45, lng: 78.40, severity: 4, populationAffected: 3000,  magnitude: 7.5, infrastructureDamage: 0.6, weatherCondition: 0.2 },
      { id: 'e3', type: 'earthquake', title: 'Bridge Collapse — Rishikesh',             lat: 30.08, lng: 78.30, severity: 4, populationAffected: 8000,  magnitude: 7.0, infrastructureDamage: 0.7, weatherCondition: 0.1 },
      { id: 'e4', type: 'earthquake', title: 'Aftershock 5.8 — Haridwar',              lat: 29.94, lng: 78.16, severity: 3, populationAffected: 15000, magnitude: 5.5, infrastructureDamage: 0.4, weatherCondition: 0.1 },
      { id: 'e5', type: 'earthquake', title: 'Hospital Evacuation — Srinagar',          lat: 30.22, lng: 78.78, severity: 4, populationAffected: 5000,  magnitude: 6.5, infrastructureDamage: 0.6, weatherCondition: 0.15 }
    ],
    evacuationPoints: [
      { lat: 30.32, lng: 78.03, name: 'Dehradun Old City' },
      { lat: 29.94, lng: 78.16, name: 'Haridwar Affected Zone' }
    ],
    safeZones: [
      { lat: 30.50, lng: 77.80, name: 'Army Base Relief Camp' },
      { lat: 29.80, lng: 77.90, name: 'Roorkee IIT Campus' }
    ],
    hazardZones: [
      { lat: 30.32, lng: 78.03, radiusKm: 10, severity: 0.95, type: 'Collapse Zone' },
      { lat: 30.45, lng: 78.40, radiusKm: 6, severity: 0.8, type: 'Landslide Area' }
    ],
    resources: { ambulances: 55, fireEngines: 20, rescueTeams: 35, helicopters: 15, medicalUnits: 25, supplyTrucks: 30 },
    timelineEvents: [
      { time: 0,   event: 'M7.2 earthquake strikes — NDRF units activated' },
      { time: 1,   event: 'Aftershock M5.1 detected — search operations begin' },
      { time: 3,   event: 'Air rescue operations launched from IAF base' },
      { time: 6,   event: 'First survivors extracted from rubble' },
      { time: 12,  event: 'Relief camps established, medical triage operational' },
      { time: 24,  event: 'M4.8 aftershock — temporary structures evacuated' }
    ]
  },

  WILDFIRE: {
    id: 'wildfire',
    name: 'Multi-Front Wildfire — Western Ghats',
    icon: '🔥',
    color: '#ff1744',
    disasterType: 'wildfire',
    center: [11.40, 76.70],
    bounds: { minLat: 10.0, maxLat: 12.5, minLng: 75.5, maxLng: 78.0 },
    description: 'Rapidly spreading wildfire across 3 fronts fueled by dry conditions and 60 km/h winds.',
    severity: 4,
    affectedPopulation: 120000,
    weatherParams: { windSpeed: 0.75, rainfall: 0.05, seismicActivity: 0.02, temperature: 0.90, humidity: 0.08, incidentReports: 0.70 },
    monteCarloParams: { windSpeed: 0.75, humidity: 0.08, windDir: 0.5, rainfall: 0.05 },
    incidents: [
      { id: 'w1', type: 'wildfire', title: 'Fire Front Alpha — Mudumalai Reserve',  lat: 11.57, lng: 76.63, severity: 4, populationAffected: 5000,  magnitude: 7.5, infrastructureDamage: 0.3, weatherCondition: 0.9 },
      { id: 'w2', type: 'wildfire', title: 'Fire Front Beta — Nilgiri Hills',        lat: 11.41, lng: 76.70, severity: 4, populationAffected: 12000, magnitude: 7.0, infrastructureDamage: 0.35, weatherCondition: 0.88 },
      { id: 'w3', type: 'wildfire', title: 'Village Evacuation — Gudalur',           lat: 11.50, lng: 76.49, severity: 3, populationAffected: 8500,  magnitude: 5.5, infrastructureDamage: 0.4, weatherCondition: 0.85 },
      { id: 'w4', type: 'wildfire', title: 'Road Cut Off — Ooty Highway',            lat: 11.41, lng: 76.70, severity: 3, populationAffected: 2000,  magnitude: 4.5, infrastructureDamage: 0.2, weatherCondition: 0.8 }
    ],
    evacuationPoints: [
      { lat: 11.57, lng: 76.63, name: 'Mudumalai Zone' },
      { lat: 11.50, lng: 76.49, name: 'Gudalur Town' }
    ],
    safeZones: [
      { lat: 11.30, lng: 76.90, name: 'Mettupalayam Evacuation Center' },
      { lat: 11.20, lng: 76.95, name: 'Coimbatore Relief Zone' }
    ],
    hazardZones: [
      { lat: 11.57, lng: 76.63, radiusKm: 12, severity: 0.9, type: 'Active Fire' },
      { lat: 11.41, lng: 76.70, radiusKm: 9,  severity: 0.85, type: 'Active Fire' }
    ],
    resources: { ambulances: 15, fireEngines: 45, rescueTeams: 25, helicopters: 10, medicalUnits: 8, supplyTrucks: 20 },
    timelineEvents: [
      { time: 0,  event: 'Fire detected — forest department alerted' },
      { time: 2,  event: 'Wind speed increases to 60 km/h — rapid spread' },
      { time: 4,  event: 'Second front detected — emergency declaration' },
      { time: 8,  event: 'Village evacuation order — 3 villages clearing' },
      { time: 16, event: 'Air tankers deployed — first containment lines' },
      { time: 30, event: 'Fire partially contained — mopping up begins' }
    ]
  },

  FLOOD: {
    id: 'flood',
    name: 'Flash Flood Emergency — Brahmaputra Valley',
    icon: '🌊',
    color: '#00b0ff',
    disasterType: 'flood',
    center: [26.14, 91.74],
    bounds: { minLat: 25.0, maxLat: 27.5, minLng: 90.0, maxLng: 93.5 },
    description: 'Extreme rainfall causing rapid flash flooding across multiple districts of Assam.',
    severity: 4,
    affectedPopulation: 3200000,
    weatherParams: { windSpeed: 0.45, rainfall: 0.96, seismicActivity: 0.05, temperature: 0.55, humidity: 0.97, incidentReports: 0.82 },
    monteCarloParams: { rainfall: 0.96, elevation: null },
    incidents: [
      { id: 'f1', type: 'flood', title: 'Dam Overflow — Kaziranga Region',      lat: 26.57, lng: 93.10, severity: 5, populationAffected: 150000, magnitude: 8.5, infrastructureDamage: 0.7, weatherCondition: 0.95 },
      { id: 'f2', type: 'flood', title: 'Guwahati City Submersion',             lat: 26.14, lng: 91.74, severity: 4, populationAffected: 950000, magnitude: 7.0, infrastructureDamage: 0.6, weatherCondition: 0.9 },
      { id: 'f3', type: 'flood', title: 'Village Stranded — Morigaon',          lat: 26.25, lng: 92.34, severity: 4, populationAffected: 25000, magnitude: 7.0, infrastructureDamage: 0.5, weatherCondition: 0.9 },
      { id: 'f4', type: 'flood', title: 'NH-37 Submerged — Nagaon',             lat: 26.35, lng: 92.69, severity: 3, populationAffected: 8000,  magnitude: 5.0, infrastructureDamage: 0.4, weatherCondition: 0.85 }
    ],
    evacuationPoints: [
      { lat: 26.57, lng: 93.10, name: 'Kaziranga Low-Lying Zone' },
      { lat: 26.25, lng: 92.34, name: 'Morigaon Villages' }
    ],
    safeZones: [
      { lat: 26.00, lng: 91.50, name: 'Guwahati High Ground Camp' },
      { lat: 25.80, lng: 90.00, name: 'Barpeta Relief Center' }
    ],
    hazardZones: [
      { lat: 26.57, lng: 93.10, radiusKm: 15, severity: 0.92, type: 'Flood Zone' },
      { lat: 26.14, lng: 91.74, radiusKm: 12, severity: 0.85, type: 'Flood Zone' }
    ],
    resources: { ambulances: 35, fireEngines: 15, rescueTeams: 40, helicopters: 20, medicalUnits: 18, supplyTrucks: 55 },
    timelineEvents: [
      { time: -12, event: 'IMD issues red alert for extreme rainfall' },
      { time: 0,   event: 'Rivers breach banks — NDRF teams deployed' },
      { time: 6,   event: 'Boat rescue operations commenced' },
      { time: 12,  event: 'Air dropping of relief supplies begins' },
      { time: 24,  event: 'Rainfall subsides — water levels receding' }
    ]
  },

  CHEMICAL: {
    id: 'chemical',
    name: 'Industrial Chemical Spill — Jamnagar Refinery',
    icon: '☣️',
    color: '#76ff03',
    disasterType: 'chemical',
    center: [22.47, 70.07],
    bounds: { minLat: 21.5, maxLat: 23.5, minLng: 69.0, maxLng: 71.5 },
    description: 'Toxic chlorine gas leak from petrochemical facility, evacuation of 5km radius underway.',
    severity: 4,
    affectedPopulation: 75000,
    weatherParams: { windSpeed: 0.50, rainfall: 0.10, seismicActivity: 0.01, temperature: 0.70, humidity: 0.40, incidentReports: 0.75 },
    monteCarloParams: { windSpeed: 0.5, humidity: 0.4, windDir: 0.8, rainfall: 0.1 },
    incidents: [
      { id: 'c1', type: 'chemical', title: 'Chlorine Tank Rupture — Refinery Unit 3', lat: 22.47, lng: 70.07, severity: 5, populationAffected: 500,   magnitude: 8.0, infrastructureDamage: 0.8, weatherCondition: 0.5 },
      { id: 'c2', type: 'chemical', title: 'Toxic Plume — Residential Zone',          lat: 22.52, lng: 70.10, severity: 4, populationAffected: 18000, magnitude: 6.5, infrastructureDamage: 0.2, weatherCondition: 0.5 },
      { id: 'c3', type: 'chemical', title: 'Mass Casualty — Nearby School',           lat: 22.49, lng: 70.05, severity: 5, populationAffected: 800,   magnitude: 8.5, infrastructureDamage: 0.1, weatherCondition: 0.5 }
    ],
    evacuationPoints: [
      { lat: 22.52, lng: 70.10, name: 'Plume Affected Zone' },
      { lat: 22.49, lng: 70.05, name: 'School Evacuation Point' }
    ],
    safeZones: [
      { lat: 22.30, lng: 69.80, name: 'Upwind Safe Zone A' },
      { lat: 22.25, lng: 70.30, name: 'Medical Triage Center' }
    ],
    hazardZones: [
      { lat: 22.47, lng: 70.07, radiusKm: 5,  severity: 1.0,  type: 'Toxic Exclusion Zone' },
      { lat: 22.52, lng: 70.12, radiusKm: 8, severity: 0.7, type: 'Plume Spread' }
    ],
    resources: { ambulances: 25, fireEngines: 10, rescueTeams: 15, helicopters: 5, medicalUnits: 30, supplyTrucks: 10 },
    timelineEvents: [
      { time: 0,  event: 'Explosion reported at refinery — HAZMAT teams activated' },
      { time: 0.5, event: 'Chlorine leak confirmed — 5km evacuation ordered' },
      { time: 1,  event: 'Casualty reports — mass decontamination begins' },
      { time: 3,  event: 'HAZMAT teams seal source — leak slowing' },
      { time: 6,  event: 'Plume dissipating — re-entry assessment begins' }
    ]
  }
};
