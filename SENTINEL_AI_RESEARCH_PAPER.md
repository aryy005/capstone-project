# Sentinel AI: An Edge-Native, AI-Enabled Emergency Response and Disaster Management Platform

**Deepika Sharma**^1, **Dhroov Chauhan**^1, **Aryan Malik**^1, **Yashasvi Saini**^1, **Abhishek Upadhyay**^1  
*Department of Computer Science and Engineering, Chandigarh University, Mohali, Punjab – 140413, India*  
Emails: `deepika.e15915@cumail.in`, `dhroovchauhan2006@gmail.com`, `malikaryan2322@gmail.com`, `yashasvisaini106@gmail.com`, `a.upadhyay1777@gmail.com`

---

## Abstract
Delays in coordinating emergency disaster response amplify the human casualties and economic losses caused by natural and industrial catastrophes. This paper presents **Sentinel AI**, an edge-native, AI-enabled emergency response and disaster management platform that brings six algorithmic modules into a single, high-performance browser-based command centre: 
1. a multi-attribute decision-tree severity classifier inspired by the Simple Triage and Rapid Treatment (START) protocol;
2. a recursive Bayesian multi-hazard threat inference engine;
3. a Monte Carlo cellular automata spread simulator ($N = 500$ runs on a $40 \times 40$ spatial lattice);
4. K-Means++ clustering with a spherical Haversine metric for emergency staging-hub placement;
5. an A\* evacuation router with an exponential risk-penalised edge-weight formulation; and
6. a two-layer feed-forward neural network for structural damage and casualty estimation.

Live meteorological telemetry is polled from the unauthenticated Open-Meteo REST API, geospatial visualization utilizes unwatermarked Esri Dark Canvas and CesiumJS 3D WebGL terrain requiring zero API keys, and automated digital alerts are exported in strict compliance with the OASIS Common Alerting Protocol (CAP) v1.2 specification for direct ingestion by National Disaster Response Force (NDRF) dispatch architectures. Field operatives are served through an installable, offline-first Progressive Web Application (PWA). Empirical execution profiling demonstrates that the entire six-model AI pipeline evaluates synchronously in **$139.0\text{ ms}$ (sub-160 ms)**, running comfortably within a 2,500 ms continuous simulation loop. The system is demonstrated across five representative Indian catastrophe scenarios: Category 4 cyclone landfall (Chennai), M7.2 Himalayan fault earthquake (Uttarakhand), Western Ghats wildfire (Nilgiris), flash flood emergency (Assam), and petrochemical toxic gas leak (Jamnagar).

**Keywords:** Emergency response, disaster management, Bayesian inference, A\* pathfinding, K-Means++, Monte Carlo simulation, decision tree, neural networks, Common Alerting Protocol, edge computing.

---

## I. Introduction

Disaster response is a time-critical, high-dimensional coordination problem. Within the initial "golden hours" following the onset of a catastrophic event, command personnel must rapidly ascertain incident severity, allocate depleted rescue fleets, anticipate secondary hazards, chart uncompromised evacuation routes, and disseminate broadcast warnings across civil defense agencies. When these decisions rely on fragmented sensory feeds and manual inter-agency communication, response latency is protracted and avoidable mortality surges. India’s National Disaster Management Plan frames disaster governance as a continuous cycle of mitigation, preparedness, response, and recovery shared across national, state, and district jurisdictions [1]. Within this operational continuum, the emergency response phase is where computational speed and tactical decision quality have the most decisive impact; a systematic survey of artificial intelligence in disaster management indicates that computational intervention yields the highest marginal utility during this acute phase [2].

Existing technological frameworks deployed in emergency operations centres (EOCs) exhibit several severe architectural liabilities:
1. **Cloud-Dependent Fragility:** Most contemporary decision-support architectures require continuous communication with remote cloud servers (Python/Node.js backends and hosted database clusters). During severe cyclones, floods, or earthquakes, terrestrial cellular base transceiver stations (BTS) and fiber-optic backbones frequently experience catastrophic physical failure, rendering cloud-dependent software completely inoperable at the tactical edge.
2. **Dynamic Route Blindness:** Conventional commercial navigation algorithms (e.g., Dijkstra-based routing on commercial road graphs) optimize purely for travel distance or transit time, remaining blind to evolving disaster boundaries and routing evacuees directly into storm surge perimeters, floodwaters, or toxic plumes.
3. **Suboptimal Logistics & Spatial Spillage:** Heuristic vehicle dispatching frequently places unconstrained fleet assets without regard to maritime coastlines or terrain barriers, leading to computational hallucinations where land vehicles are plotted into water bodies.
4. **Proprietary API Locking & Licensing Overhead:** Commercial GIS mapping platforms (e.g., Google Maps, Mapbox, CARTO) impose rigid API rate limits, registered key requirements, and substantial per-request billing, creating financial and administrative friction for public safety agencies.

To address these vulnerabilities, this paper introduces **Sentinel AI**, a unified, edge-native, zero-backend emergency management platform. The primary contributions of this work are as follows:
- **An End-to-End Six-Stage C4ISR Workflow:** Integrating incident ingestion, triage, stochastic threat simulation, optimal staging and evacuation planning, CAP alert broadcasting, and multi-state operational resolution into a unified operational loop.
- **A Unified Mathematical Formulation of Six Algorithmic Modules:** Formulating and implementing a START-inspired triage decision tree, recursive Bayesian threat reasoning, a 500-run Monte Carlo cellular automata spread simulator, spherical Haversine K-Means++ clustering, an exponentially risk-penalised A\* router ($W(e) = d(e) \cdot [1 + 1000\rho(e)]$), and a 2-layer neural damage predictor.
- **An Edge-Native, Zero-API-Key Architecture:** Operating without cloud server dependencies or proprietary API keys by combining vanilla modern JavaScript (ES6+), Leaflet GIS, CesiumJS 3D WebGL, unwatermarked Esri Dark Canvas tiles, and Open-Meteo REST telemetry.
- **Offline Resilience via PWA Standards:** Leveraging browser Service Workers (`service-worker.js`) and the Cache Storage API to guarantee autonomous client-side execution during severe network blackouts.

---

## II. Related Work

### A. Artificial Intelligence in Disaster Management
Sun et al. surveyed computational intelligence applications across disaster mitigation, preparedness, response, and recovery, observing that response-phase tools demand the lowest computational latency and highest explainability [2]. Traditional implementations, however, remain siloed: routing algorithms operate independently of meteorological forecasting, while casualty prediction models are decoupled from real-time dispatch systems. Sentinel AI synthesizes these disparate components into a synchronous operational pipeline.

### B. Incident Triage and Decision Trees
Rule-based triage protocols such as Simple Triage and Rapid Treatment (START) establish fast, deterministic casualty sorting under acute cognitive stress. Benson et al. adapted START for catastrophic earthquake environments in the START-then-SAVE methodology [3], and Garner et al. quantitatively evaluated multi-casualty triage algorithms regarding their accuracy in predicting critical trauma [4]. Whereas classical START evaluates individual physiological parameters, Sentinel AI abstracts this foundational concept to categorize entire macro-incidents using physical magnitude, exposed population, structural damage, and adverse weather coefficients.

### C. Probabilistic Threat Reasoning and Stochastic Simulation
Pearl established Bayesian networks as the normative standard for plausible inference under uncertainty [5]. In environmental hazard assessment, incoming sensor telemetry is noisy, delayed, and conflicting; recursive Bayesian updating provides a mathematically rigorous mechanism to revise disaster hypotheses as evidence accumulates. For hazard propagation where analytical fluid dynamics or thermodynamics equations are computationally intractable in real time, Metropolis and Ulam’s Monte Carlo method [6] enables rapid empirical spatial probability estimation through repeated cellular sampling.

### D. Pathfinding, Clustering, and Geodesic Geometry
Hart, Nilsson, and Raphael proved that the A\* search algorithm is strictly optimal and complete when its heuristic function $h(n)$ is admissible (i.e., never overestimates the true remaining cost to the goal) [7]. Lloyd established the foundational $k$-means quantization algorithm [8], while Arthur and Vassilvitskii formulated K-Means++, proving that distance-proportional seed initialization achieves an expected approximation factor of $\mathcal{O}(\log k)$ relative to the optimal clustering [9]. For spatial geographic calculations on the ellipsoidal Earth, Sinnott demonstrated the superior numerical stability of the spherical Haversine formula over the spherical law of cosines for small distances [10].

### E. Digital Interoperability and Open Standards
The OASIS Common Alerting Protocol (CAP) v1.2 standardizes multi-agency emergency alert messaging across disparate communications media [11]. Open-Meteo provides globally accessible, unauthenticated meteorological data derived from open numerical weather prediction models (DWD, ECMWF) [12]. Sentinel AI builds on these foundational protocols to ensure direct interoperability with statutory disaster management frameworks such as India's National Disaster Response Force (NDRF).

---

## III. Problem Statement and Objectives

Emergency operations centres frequently ingest weather observations, citizen distress reports, and fleet telematics across disconnected software interfaces. Without automated synthesis, duty officers must manually correlate atmospheric warnings, prioritize hundreds of competing incidents, identify unflooded evacuation routes, and format disparate agency circulars.

The objectives of this research are:
1. To formulate and implement a deterministic incident triage algorithm classifying emergencies into five discrete severity tiers mapped directly to institutional response standards;
2. To recursively update the posterior probability of multiple primary and secondary environmental hazards using live meteorological evidence;
3. To model spatial hazard spread across a 6-to-24 hour horizon using a 500-iteration stochastic cellular automata lattice;
4. To compute optimal, danger-avoiding evacuation corridors and mathematically optimal emergency staging hubs using spherical geodesic metrics;
5. To generate syntactically valid OASIS CAP v1.2 digital payloads for automated dispatch; and
6. To package the entire architectural suite into a zero-backend, offline-capable Progressive Web Application operating with sub-160 ms computational latency.

---

## IV. Methodology and Algorithmic Formulation

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SENTINEL AI PIPELINE                            │
│                                                                        │
│   [Stage 1: Ingestion]  ──> Open-Meteo REST API & Field Distress Feeds │
│            │                                                           │
│            ▼                                                           │
│   [Stage 2: Triage]     ──> Multi-Threshold Decision Tree (L1 - L5)    │
│            │                                                           │
│            ▼                                                           │
│   [Stage 3: Threat Sim] ──> Recursive Bayes & 500-Run Monte Carlo      │
│            │                                                           │
│            ▼                                                           │
│   [Stage 4: Logistics]  ──> K-Means++ Hubs & Risk-Penalised A* Routes  │
│            │                                                           │
│            ▼                                                           │
│   [Stage 5: Alerting]   ──> OASIS CAP v1.2 JSON & PWA Web Push         │
│            │                                                           │
│            ▼                                                           │
│   [Stage 6: Resolution] ──> 2D/3D Tactical GIS Tracking & Status Loop │
└────────────────────────────────────────────────────────────────────────┘
```
*Fig. 1. Sentinel AI six-stage operational C4ISR workflow with embedded damage estimation.*

### A. Operational Workflow
Sentinel AI structures crisis operations into a closed-loop six-stage pipeline (Fig. 1). In Stage 1 (*Incident Ingestion*), live meteorological feeds are polled alongside citizen distress logs. Stage 2 (*Severity Triage*) executes multi-factor rule-based sorting. Stage 3 (*Threat & Risk Simulation*) quantifies primary hazard probabilities and projects spatial spread. Stage 4 (*Resource & Route Planning*) positions strategic staging camps and charts hazard-avoiding corridors. Stage 5 (*Alert Dispatch*) generates standardized CAP v1.2 alerts and issues browser push sirens. Stage 6 (*Monitoring & Resolution*) tracks responder units through active operational lifecycles (`ACTIVE` $\to$ `DEPLOYED` $\to$ `CONTAINED` $\to$ `RESOLVED`).

### B. Decision-Tree Severity Triage
The triage engine (`SeverityClassifier`) evaluates five continuous and discrete features: event magnitude $M \in [0, 10]$, exposed population $P$, infrastructure damage coefficient $I \in [0, 1]$, weather adversity $W \in [0, 1]$, and elapsed response time. The decision tree structure branches primarily on event magnitude $M$:

```
                            [ROOT: Incident Ingested]
                                        │
                        Is Magnitude < 2, < 4, < 6, < 8, or ≥ 8?
        ┌──────────────┬────────────────┼──────────────┬──────────────┐
        │              │                │              │              │
    [Mag < 2]     [2 ≤ Mag < 4]    [4 ≤ Mag < 6]   [6 ≤ Mag < 8]   [Mag ≥ 8]
        │              │                │              │              │
   Population?    Infra Damage?    Population?    Infra Damage?   Population?
     (< 100)         (< 0.3)         (< 1,000)       (< 0.6)       (< 10,000)
     ├── < 100       ├── < 0.3       ├── < 1,000     ├── < 0.6     ├── < 10k
     │   └── L1      │   └── L2      │   └── L3      │   └── L4    │   └── L4
     └── ≥ 100       └── ≥ 0.3       └── ≥ 1,000     └── ≥ 0.6     └── ≥ 10k
         └── L2          └── L3          │               └── L5        └── L5
                                     Weather?      (CATASTROPHIC)(CATASTROPHIC)
                                      (< 0.5)
                                      ├── < 0.5 ──> L3 (MODERATE)
                                      └── ≥ 0.5 ──> L4 (SEVERE)
```

**Table I: Incident Triage Standard Matrix**
| Level ($S$) | Label | Response Target | Operational Protocol | Mandated Institutional Deployment |
|:---:|:---:|:---:|:---|:---|
| **5** | Critical | $< 15\text{ min}$ | Maximum Response + Federal Aid | NDRF battalions, air support squadrons, advanced mobile ICU trauma units |
| **4** | High | $< 30\text{ min}$ | Full Regional Mobilization | State Disaster Response Force (SDRF), regional fire & rescue fleet |
| **3** | Moderate | $< 60\text{ min}$ | Enhanced Sector Response | District civil defense teams, municipal medical squads, police patrols |
| **2** | Low | $< 120\text{ min}$ | Standard Local Dispatch | Local fire station units, municipal ambulances |
| **1** | Minimal | Continuous | Monitored Standby | Municipal surveillance, local advisory monitoring |

Upon assigning severity tier $S \in \{1, 2, 3, 4, 5\}$, required resources are sized parametrically:
$$\text{Ambulances} = \left\lceil S \times 1.5 + \frac{P}{5,000} \right\rceil, \quad \text{Fire Engines} = \lceil S \times 1.2 \rceil, \quad \text{Rescue Teams} = \lceil S \times 2.0 \rceil$$
$$\text{Medical Units} = \left\lceil S \times 1.0 + \frac{P}{10,000} \right\rceil, \quad \text{Helicopters} = \begin{cases} \lceil S \times 0.5 \rceil & \text{if } S \ge 4 \\ 0 & \text{if } S < 4 \end{cases}$$
$$\text{Total Personnel} = S \times 25 + \left\lceil \frac{P}{1,000} \right\rceil$$

### C. Recursive Bayesian Threat Inference
The threat assessment engine maintains a probability distribution over seven disaster categories ($D_k \in \{\text{hurricane}, \text{flood}, \text{earthquake}, \text{wildfire}, \text{chemical}, \text{tsunami}, \text{tornado}\}$). Telemetry evidence vector $\mathbf{E}_t = [e_1, e_2, \dots, e_6]$ comprises wind speed, precipitation rate, seismic intensity, ambient temperature, relative humidity, and crowd-sourced incident density. Continuous inputs are normalized into four bins: Low ($[0, 0.25)$), Moderate ($[0.25, 0.50)$), High ($[0.50, 0.75)$), and Extreme ($[0.75, 1.0]$).

The posterior probability distribution is updated recursively via Bayes' Theorem under conditional independence:
$$P(D_k \mid \mathbf{E}_t) = \frac{P(D_k) \prod_{i=1}^6 P(e_i \mid D_k)}{\sum_{j=1}^7 P(D_j) \prod_{i=1}^6 P(e_i \mid D_j)}$$
To preserve temporal continuity across the $2,500\text{ ms}$ polling cycle, posteriors update recursively such that $\pi_k(t+1) = P(D_k \mid \mathbf{E}_t)$.

### D. Monte Carlo Stochastic Spread Simulation
To project hazard evolution across a 6-to-24 hour window without analytical differential equations, Sentinel AI evaluates $N = 500$ stochastic iterations over a $40 \times 40$ cellular automata grid (1,600 spatial cells). 

For wildland fire or flood boundaries, transition probability from cell $(r, c)$ to adjacent neighbor $(r + \Delta r, c + \Delta c)$ is formulated as:
$$P_{\text{spread}} = \text{clamp}\left( v_{\text{wind}} \cdot (1 - H) \cdot 0.8 + (\Delta r \sin \theta_w + \Delta c \cos \theta_w) \cdot 0.3, \ 0, \ 1 \right)$$
where $v_{\text{wind}}$ is normalized wind speed, $H$ is relative humidity, and $\theta_w$ represents the dominant atmospheric wind direction vector. Accumulating across all $N$ runs yields the spatial probability $p_c$ for each cell:
$$p_c = \frac{1}{N} \sum_{k=1}^N I_k(c), \quad I_k(c) \in \{0, 1\}$$

### E. K-Means++ Emergency Staging Clustering
First-responder logistical hubs and field triage hospitals are positioned at cluster centroids of active incident distributions. Initial cluster seeds are chosen via **K-Means++** initialization, wherein the probability of choosing point $x$ as the next center is proportional to the square of its distance from the closest existing center:
$$P(x) = \frac{D(x)^2}{\sum_{x' \in X} D(x')^2}$$
Distances between geographic coordinates $(\phi_1, \lambda_1)$ and $(\phi_2, \lambda_2)$ are computed using the spherical **Haversine metric**:
$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos \phi_1 \cos \phi_2 \sin^2\left(\frac{\Delta \lambda}{2}\right)$$
$$d_{\text{Haversine}} = 2R \arcsin(\sqrt{a}), \quad R = 6,371\text{ km}$$
The optimal number of hubs $K$ is selected via the elbow criterion by minimizing Within-Cluster Sum of Squares (WCSS):
$$\text{WCSS} = \sum_{i=1}^K \sum_{x \in S_i} d_{\text{Haversine}}(x, \mu_i)^2$$

### F. A\* Evacuation Routing with Hazard Penalization
Evacuation corridors are computed across a discrete $50 \times 50$ lattice. Path cost evaluation follows:
$$f(n) = g(n) + h(n)$$
where $g(n)$ is accumulated path cost and $h(n)$ is Euclidean distance to the designated relief camp. To force evacuation paths around active danger perimeters, edge weights $W(e)$ incorporate an exponential hazard penalty:
$$W(e) = d(e) \cdot \left(1 + \alpha \cdot \rho(e)\right), \quad \alpha = 1,000$$
where $d(e)$ is Euclidean metric distance and $\rho(e) \in [0, 1]$ represents normalized hazard risk. Because $W(e) \ge d(e)$, the Euclidean heuristic never overestimates the true remaining cost ($h(n) \le h^*(n)$), strictly preserving heuristic admissibility and A\* path optimality while detouring around active disaster perimeters.

### G. Neural-Network Damage Predictor
A two-layer feed-forward neural network with sigmoid hidden activations and linear output scaling predicts expected casualties and monetary infrastructure loss. Input vector $\mathbf{x} = [x_1, x_2, x_3, x_4]^T \in [0, 1]^4$ normalizes incident magnitude, wind velocity, exposed population, and structural infrastructure vulnerability:
$$\mathbf{x} = \begin{bmatrix} \text{clamp}(M / 10, \ 0, \ 1) \\ \text{clamp}(v_{\text{wind}}, \ 0, \ 1) \\ \text{clamp}(P / 100,000, \ 0, \ 1) \\ \text{clamp}(I_{\text{damage}}, \ 0, \ 1) \end{bmatrix}$$
Hidden activations $\mathbf{h} \in \mathbb{R}^5$ and linear outputs $\mathbf{y} \in \mathbb{R}^2$ compute:
$$\mathbf{h} = \sigma(\mathbf{W}_1 \mathbf{x} + \mathbf{b}_1) = \frac{1}{1 + e^{-(\mathbf{W}_1 \mathbf{x} + \mathbf{b}_1)}}, \quad \mathbf{y} = \mathbf{W}_2 \mathbf{h} + \mathbf{b}_2$$
Outputs are dimensionally scaled to concrete operational units:
$$\hat{y}_{\text{casualties}} = \lfloor y_1 \cdot P \cdot 0.015 \rceil, \quad \hat{y}_{\text{loss}} = y_2 \cdot M \cdot 4.2 \quad (\text{USD Millions})$$
$$\mathcal{R}_{\text{index}} = \frac{1}{2} \left( \frac{\hat{y}_{\text{casualties}}}{100} + \frac{\hat{y}_{\text{loss}}}{10} \right)$$
Network parameters $\theta = \{\mathbf{W}_1, \mathbf{b}_1, \mathbf{W}_2, \mathbf{b}_2\}$ were calibrated using Mean Squared Error (MSE) regularized with $L_2$ weight decay over historical post-disaster records from the National Disaster Management Authority (NDMA) and the Emergency Events Database (EM-DAT):
$$\mathcal{L}(\theta) = \frac{1}{2M} \sum_{i=1}^M \left\| \hat{\mathbf{y}}^{(i)} - \mathbf{y}_{\text{true}}^{(i)} \right\|_2^2 + \frac{\lambda}{2} \left( \|\mathbf{W}_1\|_F^2 + \|\mathbf{W}_2\|_F^2 \right)$$

### H. Alert Generation and Interoperability
Sentinel AI generates machine-readable dispatch circulars adhering strictly to the **OASIS Common Alerting Protocol (CAP) v1.2** specification. In parallel, payloads trigger client-side sirens via the HTML5 Web Notifications API on registered Progressive Web Application (PWA) clients.

**Table II: Mapping of Sentinel AI Attributes to OASIS CAP v1.2 Specification**
| Sentinel AI Internal Attribute | OASIS CAP v1.2 XML/JSON Field | Transformation & Value Logic | Example Serialized Payload |
|:---|:---|:---|:---|
| Incident Identifier | `<identifier>` | Uniform prefix `NDRF-IN-` + millisecond timestamp | `NDRF-IN-1727276160000` |
| System Identity | `<sender>` | Fixed platform token | `SENTINEL.AI.DISASTER.PLATFORM` |
| System Clock | `<sent>` | ISO 8601 UTC timestamp format | `2026-10-10T00:05:21Z` |
| Operational State | `<status>` | Hardcoded active indicator | `Actual` |
| Message Category | `<msgType>` | Initial broadcast or containment revision | `Alert` (or `Update`) |
| Severity Level ($S$) | `<urgency>` | If $S \ge 4 \implies$ `"Immediate"`, else `"Expected"` | `Immediate` |
| Severity Level ($S$) | `<severity>` | $S=5 \implies$ `"Extreme"`; $S=4 \implies$ `"Severe"`; $S \le 3 \implies$ `"Moderate"` | `Extreme` |
| Verification Source | `<certainty>` | Telemetry-confirmed status | `Observed` |
| Disaster Category | `<eventCode>` | ValueName `"NDRF_CODE"`, value capitalized disaster token | `HURRICANE` |
| Dynamic Expiry | `<expires>` | Current timestamp $+ 86,400,000\text{ ms}$ (24-hour horizon) | `2026-10-11T00:05:21Z` |
| Title & Triage Tier | `<headline>` | Concatenation of priority prefix and incident title | `NDRF Priority Alert: Storm Surge — Marina Beach` |
| Triage Parameters | `<description>` | Population exposed, active units, damage metrics | `Dispatch for Chennai Coastal Zone. Pop: 80,000. Units: 15.` |
| A\* Evacuation Plan | `<instruction>` | Directive referencing generated evacuation corridors | `Report to pre-positioned A* evacuation corridors immediately.` |
| Coordinates & Buffer | `<area><circle>` | Geographic circular geofence: `lat,lng,radius_in_meters` | `13.050,80.272,4500` |

---

## V. System Architecture and Implementation

### A. Architecture and Technology Stack
Sentinel AI is implemented as an edge-native, zero-backend single-page web application. The platform completely eliminates server-side computational bottlenecks by executing all algorithms directly within the client's browser engine.

**Table III: Sentinel AI Technology Stack Specification**
| Architectural Layer | Underlying Technology | Version / Source | Function in Sentinel AI |
|:---|:---|:---:|:---|
| **Frontend Core** | HTML5, CSS3, Vanilla ES6+ JavaScript | Native Browser | Responsive HUD, glassmorphism UI, zero-build execution |
| **2D GIS Tactical Map** | Leaflet.js + Leaflet.heat | v1.9.4 / v0.2.0 | Spatial rendering of incidents, corridors, hazard polygons, and heatmaps |
| **Tactical Basemaps** | Esri Dark Gray Canvas & OpenStreetMap | Public Servers | **Zero-API-key architecture**; unwatermarked high-contrast tactical mapping |
| **3D Virtual Globe** | CesiumJS (WebGL Engine) | v1.115 | Planetary terrain mode using unauthenticated open tile services (`baseLayer: false`) |
| **Weather Telemetry** | Open-Meteo REST API | Unauthenticated | Global live polling of wind speed, rainfall, temperature, and humidity |
| **Alert Interoperability** | OASIS CAP v1.2 Standard | JSON / XML | Standardized digital payload export for NDRF and State EOC dispatch |
| **Offline Resilience** | Web App Manifest & Service Worker API | Cache-First PWA | Full offline capability during infrastructure blackouts |
| **Data Analytics** | Chart.js | v4.4 (Canvas 2D) | Real-time incident trajectory, threat radar, and Monte Carlo convergence curves |

```
                       OFFLINE RESILIENCE (SERVICE WORKER)
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
   [Network Online]                                          [Network Offline]
Fetch Open-Meteo Weather API                          Intercept via service-worker.js
           │                                                         │
           ▼                                                         ▼
Render Esri Dark Basemaps                             Serve Cached Assets & Tiles
           │                                                         │
           ▼                                                         ▼
Execute 6 AI Engines in RAM                           Execute 6 AI Engines in RAM
(Browser V8 Engine: 139 ms)                           (Browser V8 Engine: 139 ms)
```
*Fig. 2. Edge-native Service Worker interception ensuring zero-internet execution.*

### B. Geospatial Land-Bounding & Fleet Allocation Logic
In maritime catastrophe zones (such as Chennai cyclone landfall along longitude $80.275^\circ\text{E}$), unconstrained radial dispatch algorithms frequently scatter land vehicles into the Bay of Bengal ocean. Sentinel AI introduces explicit polygon and longitudinal land constraints:
$$\lambda_{\text{resource}} \in [\lambda_{\text{min}}, \lambda_{\text{max}}], \quad \text{where } \lambda_{\text{max}} \le \lambda_{\text{coastline}} - \delta_{\text{safety}}$$
For Chennai, longitude is clamped to $\lambda_{\text{max}} = 80.265^\circ\text{E}$ ($\ge 1.5\text{ km}$ inland), and vehicle staging is restricted to verified land depots: Kilpauk Medical Base ($13.082^\circ\text{N}, 80.241^\circ\text{E}$), Guindy NDRF Base ($13.008^\circ\text{N}, 80.218^\circ\text{E}$), and Tambaram Air Base ($12.924^\circ\text{N}, 80.142^\circ\text{E}$). The live tactical map applies an active deployment filter ($\le 20$ active field units) to eliminate visual marker overlapping while preserving complete fleet accounting ($158$ units) in the resource database.

---

## VI. Results and Discussion

### A. Empirical Latency and Throughput Benchmarks
To evaluate real-time responsiveness, execution times across all six algorithmic modules were empirically profiled on consumer-grade hardware (Intel Core i5-1235U, 16 GB DDR4 RAM, Google Chrome V8 engine).

**Table IV: Empirical Execution Latency of Sentinel AI Engine Pipeline**
| Processing Stage / AI Module | Algorithmic Implementation | Computational Complexity | Mean Execution Latency |
|:---|:---|:---:|:---:|
| **1. Threat Inference** | Recursive Bayesian Update (`bayesian.js`) | $\mathcal{O}(D \cdot E)$ | **$1.20\text{ ms}$** |
| **2. Incident Triage** | START Multi-Factor Decision Tree (`decision-tree.js`) | $\mathcal{O}(d), \ d \le 5$ | **$0.42\text{ ms}$** |
| **3. Staging Hub Placement** | K-Means++ with Haversine Metric (`kmeans.js`) | $\mathcal{O}(k \cdot n \cdot i)$ | **$3.80\text{ ms}$** |
| **4. Evacuation Routing** | Risk-Penalised A\* on $50 \times 50$ Grid (`astar.js`) | $\mathcal{O}(\|V\| \log \|V\| + \|E\|)$ | **$18.50\text{ ms}$** |
| **5. Hazard Spread Simulation** | 500-Run Stochastic Cellular Automata (`monte-carlo.js`) | $\mathcal{O}(N \cdot R \cdot C)$ | **$115.00\text{ ms}$** |
| **6. Damage & Loss Estimation** | 2-Layer Feed-Forward Neural Network (`neural-net.js`) | $\mathcal{O}(n_{\text{in}} n_h + n_h n_{\text{out}})$ | **$0.08\text{ ms}$** |
| **Complete Synchronous Pipeline** | **All 6 Algorithmic Modules** | — | **$\mathbf{139.00\text{ ms}}$** |
| **Telemetry Refresh Loop** | Asynchronous Simulation Tick Interval | Configured rate | $2,500\text{ ms}$ |
| **OASIS CAP Payload Export** | JSON Serialization & DOM Blob Stream | $\mathcal{O}(1)$ | $15.20\text{ ms}$ |

The entire multi-hazard reasoning, routing, clustering, and damage prediction cycle executes synchronously in **$139.0\text{ ms}$ (sub-160 milliseconds)**. This confirms that Sentinel AI operates within $\approx 5.5\%$ of its $2,500\text{ ms}$ refresh window, leaving over $94\%$ of CPU capacity idle for rendering and user interaction.

### B. Scenario Verification Matrix
The platform was validated across five diverse catastrophe scenarios calibrated against real Indian historical events:

**Table V: Disaster Scenario Verification Matrix**
| Scenario Key | Disaster Type & Location | Historical Event Modeled | Population at Risk | Primary AI Classification | Computed Route Characteristics |
|:---|:---|:---|:---:|:---:|:---|
| **`HURRICANE`** | Category 4 Cyclone (Chennai Coast) | Cyclone Michaung (2023) / Vardah (2016) | 2,400,000 | Hurricane @ 94.2% prob. (L5 Critical) | Bypasses Marina surge zone $\to$ Anna Univ ($4.6\text{ km}$, $6.9\text{ min}$) |
| **`EARTHQUAKE`** | M7.2 Fault Rupture (Uttarakhand) | Uttarkashi (1991) / Chamoli (1999) | 850,000 | Earthquake @ 98.1% prob. (L5 Critical) | Bypasses NH-58 landslide $\to$ Roorkee Camp ($12.1\text{ km}$, $18.2\text{ min}$) |
| **`WILDFIRE`** | Multi-Front Wildfire (Nilgiris) | Bandipur / Mudumalai Fires (2019/2024) | 120,000 | Wildfire @ 91.4% prob. (L4 High) | Avoids Mudumalai front $\to$ Mettupalayam Center ($8.4\text{ km}$, $12.6\text{ min}$) |
| **`FLOOD`** | Brahmaputra Flash Flood (Assam) | Assam Mega-Floods (2022/2024) | 3,200,000 | Flood @ 96.5% prob. (L5 Critical) | Bypasses submerged NH-37 $\to$ Guwahati High Ground ($6.2\text{ km}$, $9.3\text{ min}$) |
| **`CHEMICAL`** | Toxic Chlorine Leak (Jamnagar) | Vizag Gas Leak (2020) calibration | 75,000 | Chemical @ 89.7% prob. (L5 Critical) | Routes upwind of dispersion plume $\to$ Lalpur Base ($5.1\text{ km}$, $7.6\text{ min}$) |

### C. Discussion and Limitations
Executing all models on the client edge ensures that tactical operations remain functional in disconnected disaster environments. The primary limitations of the present prototype include:
1. **Grid Discretization Constraints:** A\* pathfinding executes on a $50 \times 50$ discrete lattice; resolving multi-lane urban street layouts at meter-level fidelity requires integration with vectorized OpenStreetMap road network graphs.
2. **Simplified Cellular Automata Physics:** The Monte Carlo spread engine models atmospheric wind and moisture factors but excludes high-resolution digital elevation models (DEM) and variable fuel moisture kinetics.
3. **Synthetic Calibration Data:** While initial weights are calibrated to historical disaster averages, extensive real-time validation against live sensor telemetry across multi-year field exercises remains planned for future research.

---

## VII. Conclusion and Future Scope

This paper introduced **Sentinel AI**, a unified, edge-native emergency response platform integrating decision-tree triage, recursive Bayesian threat reasoning, Monte Carlo spread simulation, K-Means++ clustering, risk-penalised A\* routing, and neural-network damage estimation. By replacing server-dependent backends with an offline-capable Progressive Web Application operating on free, open GIS protocols, Sentinel AI achieves an empirical execution latency of **$139.0\text{ ms}$** with zero API licensing overhead and zero server infrastructure costs.

Planned future extensions include:
1. **Edge Computer Vision:** Integrating lightweight YOLOv8 models executed via WebAssembly/WebGPU for real-time aerial drone survivor detection;
2. **Multilingual Speech Ingestion:** Integrating the OpenAI Whisper model for regional-language emergency call processing;
3. **Two-Way Government Synchronization:** Direct API integration with the National Disaster Management Authority (NDMA) ERSS-112 national emergency infrastructure; and
4. **Peer-to-Peer Tactical Mesh Networking:** Incorporating Bluetooth Low Energy (BLE) and LoRa radio protocols to enable inter-device telemetry synchronization in zero-cellular environments.

---

## References

[1] National Disaster Management Authority, Government of India, *National Disaster Management Plan*, New Delhi, India, Nov. 2019.  
[2] W. Sun, P. Bocchini, and B. D. Davison, "Applications of artificial intelligence for disaster management," *Natural Hazards*, vol. 103, pp. 2631–2689, 2020, doi: 10.1007/s11069-020-04124-3.  
[3] M. Benson, K. L. Koenig, and C. H. Schultz, "Disaster triage: START, then SAVE—A new method of dynamic triage for victims of a catastrophic earthquake," *Prehospital and Disaster Medicine*, vol. 11, pp. 117–124, 1996.  
[4] A. Garner, A. Lee, K. Harrison, and C. H. Schultz, "Comparative analysis of multiple-casualty incident triage algorithms," *Annals of Emergency Medicine*, vol. 38, no. 5, pp. 541–548, Nov. 2001, doi: 10.1067/mem.2001.119053.  
[5] J. Pearl, *Probabilistic Reasoning in Intelligent Systems: Networks of Plausible Inference*, San Mateo, CA, USA: Morgan Kaufmann, 1988.  
[6] N. Metropolis and S. Ulam, "The Monte Carlo method," *Journal of the American Statistical Association*, vol. 44, no. 247, pp. 335–341, 1949.  
[7] P. E. Hart, N. J. Nilsson, and B. Raphael, "A formal basis for the heuristic determination of minimum cost paths," *IEEE Transactions on Systems Science and Cybernetics*, vol. 4, no. 2, pp. 100–107, Jul. 1968.  
[8] S. P. Lloyd, "Least squares quantization in PCM," *IEEE Transactions on Information Theory*, vol. 28, no. 2, pp. 129–137, Mar. 1982.  
[9] D. Arthur and S. Vassilvitskii, "k-means++: The advantages of careful seeding," in *Proc. 18th Annu. ACM-SIAM Symp. Discrete Algorithms (SODA)*, New Orleans, LA, USA, 2007, pp. 1027–1035.  
[10] R. W. Sinnott, "Virtues of the haversine," *Sky and Telescope*, vol. 68, no. 2, p. 159, 1984.  
[11] OASIS, *Common Alerting Protocol Version 1.2*, OASIS Standard, Jul. 2010.  
[12] P. Zippenfenig, "Open-Meteo.com Weather API," *Zenodo*, 2023, doi: 10.5281/zenodo.7970649.  
[13] D. E. Rumelhart, G. E. Hinton, and R. J. Williams, "Learning representations by back-propagating errors," *Nature*, vol. 323, pp. 533–536, 1986.  
[14] J. Redmon, S. Divvala, R. Girshick, and A. Farhadi, "You only look once: Unified, real-time object detection," in *Proc. IEEE Conf. Comput. Vis. Pattern Recognit. (CVPR)*, 2016, pp. 779–788.  
[15] A. Radford et al., "Robust speech recognition via large-scale weak supervision," in *Proc. 40th Int. Conf. Mach. Learn. (ICML)*, 2023, pp. 28492–28518.  
