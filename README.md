# 🚨 Sentinel AI — AI Enabled Emergency Response & Disaster Management Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![AI-Powered](https://img.shields.io/badge/AI-6%20Algorithms-7c4dff.svg)
![PWA-Ready](https://img.shields.io/badge/PWA-Installable-00d4ff.svg)
![NDRF-CAP](https://img.shields.io/badge/CAP-v1.2%20Compliant-ff1744.svg)

**Sentinel AI** (*AI Emergency Guardian & Intelligence System*) is a real-time, browser-native disaster management and emergency response platform powered by client-side AI algorithms, live meteorological REST APIs, 2D/3D GIS mapping engines, and standardized OASIS CAP alert dispatch protocols.

---

## 🌟 Key Features & AI Algorithmic Engines

### 🧠 1. Bayesian Threat Assessment Network (`js/ai/bayesian.js`)
- **Multi-Hazard Posterior Inference**: Computes $P(\text{Disaster} \mid \text{Evidence})$ based on live environmental telemetry (wind speed, rainfall, seismic activity, temperature, humidity, incident reports).

### 🛣️ 2. A* Evacuation Route Optimizer (`js/ai/astar.js`)
- **Heuristic Pathfinding**: Implements $f(n) = g(n) + h(n)$ pathfinding on a dynamic spatial grid with penalty weighting $W(e) = \text{Dist}(e) \times (1 + 1000 \times \text{Risk}(e))$ to automatically route around active danger zones.

### ⛺ 3. K-Means++ Resource Clustering (`js/ai/kmeans.js`)
- **Spatial Centroid Optimization**: Uses K-Means++ initialization with spherical Haversine distance calculations to establish optimal staging hubs and relief camp locations.

### 🌲 4. Decision Tree Severity Classifier (`js/ai/decision-tree.js`)
- **START Triage Protocol**: Multi-factor classification into 5 severity levels (L1 Minimal to L5 Critical) based on magnitude, population affected, and infrastructure damage.

### 📈 5. Monte Carlo Risk Simulator (`js/ai/monte-carlo.js`)
- **Probabilistic Disaster Propagation**: Runs 500 stochastic cellular automata iterations to predict wildfire fronts, flood inundation, and earthquake shaking heatmaps.

### 🤖 6. Neural Network Damage Predictor (`js/ai/neural-net.js`)
- **Feed-Forward ML Predictor**: 2-layer Neural Network predicting non-linear casualty estimates and financial loss based on magnitude, wind, population, and infrastructure vulnerability.

---

## 🌐 Real-Time External APIs & Enterprise Features

- **Open-Meteo REST API**: Fetches real live weather telemetry (wind speed, rain, temp, humidity) for scenario GPS coordinates (Chennai, Uttarakhand, Assam, Jamnagar).
- **OASIS CAP v1.2 Export**: One-click generation and export of official NDRF Common Alerting Protocol JSON alert dispatches.
- **PWA Mobile App Support**: Offline-capable Progressive Web App with `manifest.json` and `service-worker.js` for mobile responder smartphones.
- **2D/3D GIS Command Map**: Toggle between 2D Tactical Map and 3D Tactical Perspective Map.
- **Light & Dark Theme Switcher**: Full custom CSS variable theme engine with map tile adaptation and chart color syncing.

---

## 🚀 Getting Started

### Running Locally

```bash
# Clone repository
git clone https://github.com/aryy005/capstone-project.git
cd capstone-project

# Start local server on port 8080
npx -y http-server -p 8080 -c-1 --cors
```
Open **`http://localhost:8080`** in your web browser!

---

## 🎓 Phase 2 Roadmap
1. **YOLOv8 Aerial Computer Vision**: Automated survivor and damage detection from drone feeds.
2. **Whisper Speech-to-Text**: Multilingual regional Indian emergency call processing.
3. **NDMA / NDRF Live API Sync**: Direct server-to-server alert integration.
4. **Offline Mesh Networking**: Peer-to-peer responder communication in zero-cell-coverage zones.
