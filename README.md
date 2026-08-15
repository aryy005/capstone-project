# 🚨 AEGIS — AI Emergency Response & Disaster Management Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![AI-Powered](https://img.shields.io/badge/AI-5%20Algorithms-7c4dff.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow.svg)

**AEGIS** (*AI Emergency Guardian & Intelligence System*) is a real-time, browser-based disaster management and emergency response platform powered by client-side AI algorithms. Designed for emergency command centers, rescue coordinators, and field teams.

---

## 🌟 Key Features & AI Algorithms

### 🧠 1. Bayesian Threat Assessment Network (`js/ai/bayesian.js`)
- **Multi-Hazard Posterior Inference**: Computes $P(\text{Disaster} \mid \text{Evidence})$ based on live environmental telemetry (wind speed, rainfall, seismic activity, temperature, humidity, incident reports).
- **Dynamic Threat Gauge**: Real-time score calculation classifying overall risk (Minimal → Critical).

### 🛣️ 2. A* Evacuation Route Optimizer (`js/ai/astar.js`)
- **Heuristic Pathfinding**: Implements $f(n) = g(n) + h(n)$ pathfinding on a dynamic spatial grid.
- **Hazard Penalty Weighting**: Applies dynamic weight function $W(e) = \text{Dist}(e) \times (1 + 1000 \times \text{Risk}(e))$ to automatically route around active danger zones.

### ⛺ 3. K-Means++ Resource Clustering (`js/ai/kmeans.js`)
- **Spatial Centroid Optimization**: Uses K-Means++ initialization with spherical Haversine distance calculations.
- **Resource Matchmaking**: Recommends optimal allocation of ambulances, fire engines, and rescue teams per staging hub.

### 🌲 4. Decision Tree Severity Classifier (`js/ai/decision-tree.js`)
- **START Triage Protocol**: Multi-factor classification into 5 severity levels based on magnitude, population affected, infrastructure damage, and weather conditions.

### 📈 5. Monte Carlo Risk Simulator (`js/ai/monte-carlo.js`)
- **Probabilistic Disaster Propagation**: Runs 1,000 cellular automata iterations combining environmental noise to predict wildfire fronts, flood inundation, and earthquake shaking heatmaps.

---

## 🎨 UI & Command Center Capabilities

- **Interactive GIS Command Map**: Leaflet.js map layer with live incident markers, hazard circles, evacuation corridors, and AI staging hubs.
- **5 Pre-Built Disaster Scenarios**:
  - 🌀 **Cat 4 Hurricane** (Chennai Coast)
  - 🌋 **M7.2 Earthquake** (Uttarakhand Fault Line)
  - 🔥 **Multi-Front Wildfire** (Nilgiris / Western Ghats)
  - 🌊 **Flash Flood Emergency** (Assam Brahmaputra Valley)
  - ☣️ **Industrial Chemical Leak** (Jamnagar Petrochemical Complex)
- **Real-Time Data Simulator**: Live updates for weather telemetry, seismic events, dispatch communications, and fleet fuel levels every 2.5 seconds.
- **Analytics Suite**: Dynamic Chart.js line charts, resource distribution doughnuts, severity histograms, and threat radar charts.

---

## 🚀 Getting Started

### Prerequisites
No complex installation required! All core dependencies (Leaflet.js, Chart.js) are included via CDN.

### Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<YOUR-USERNAME>/disaster-platform.git
   cd disaster-platform
   ```

2. **Start a local static web server:**

   *Using Python:*
   ```bash
   python -m http.server 8080
   ```

   *Using Node.js (`npx http-server`):*
   ```bash
   npx http-server -p 8080
   ```

3. **Open in Browser:**
   Navigate to `http://localhost:8080` in your web browser.

---

## 📂 Project Architecture

```
disaster-platform/
├── index.html              # Main HTML Shell & View Containers
├── README.md               # Documentation
├── css/
│   ├── index.css           # Design System & Design Tokens
│   ├── dashboard.css       # KPI & Panel Layout Styles
│   ├── map.css             # Leaflet & GIS Overlay Styles
│   └── components.css      # Toasts, Modals, Resources & Comms
└── js/
    ├── app.js              # Application Controller
    ├── ai/
    │   ├── bayesian.js     # Bayesian Threat Network
    │   ├── astar.js        # A* Evacuation Pathfinding
    │   ├── kmeans.js       # K-Means Resource Clustering
    │   ├── decision-tree.js # START Protocol Severity Triage
    │   └── monte-carlo.js  # Monte Carlo Spread Simulator
    ├── data/
    │   ├── simulator.js    # Real-Time Telemetry Data Generator
    │   └── scenarios.js    # Pre-built Disaster Scenarios
    ├── components/
    │   ├── alerts.js       # Toast & Modal Notification System
    │   ├── dashboard.js    # Dashboard UI Renderer
    │   ├── map-manager.js  # Leaflet Map Manager
    │   ├── resources.js    # Fleet & Asset Management
    │   ├── comms.js        # Live Radio & Dispatch Feed
    │   └── charts.js       # Chart.js Visualizations
    └── utils/
        ├── constants.js    # System Configurations
        └── helpers.js      # Haversine Distance & Math Helpers
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
