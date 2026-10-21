window.DP = window.DP || {};

/**
 * Sentinel AI - Phase 2 Advanced C4ISR Modules
 * 1. Aerial Drone Computer Vision (YOLOv8 Edge Simulation & Geotagger)
 * 2. Emergency 112 Voice Call Analyzer (Whisper AI Speech-to-Text & NLP Entity Extraction)
 * 3. Official Executive Situation Report (SITREP) PDF/Print Engine
 * 4. Citizen SOS / Dynamic Incident Injector (Live Demonstration Trigger)
 */
window.DP.Phase2 = {
  // Active state
  droneActiveFeed: 'thermal', // thermal | optical | night
  droneAnimFrame: null,
  whisperInterval: null,
  activeAudioPreset: 0,

  // ===== 1. DRONE RECONNAISSANCE (YOLOv8) HUD =====
  openDroneReconModal() {
    this.closeModal();

    const center = window.DP.App?.selectedScenario?.center || [13.048, 80.268];
    const scenName = window.DP.App?.selectedScenario?.name || 'Coastal Disaster Perimeter';

    const modalHtml = `
      <div class="phase2-modal-backdrop" id="phase2-modal-backdrop" onclick="if(event.target===this) window.DP.Phase2.closeModal()">
        <div class="phase2-modal">
          <div class="phase2-modal-header">
            <div class="phase2-modal-title">
              <span>🛸</span>
              <span>Aerial Reconnaissance Drone — Tactical Feed</span>
              <span class="phase2-badge phase2-badge-yolo">YOLOv8 Edge AI</span>
            </div>
            <button class="phase2-modal-close" onclick="window.DP.Phase2.closeModal()">✕</button>
          </div>

          <div class="phase2-modal-body">
            <!-- Drone Viewport -->
            <div class="drone-viewport">
              <canvas id="drone-canvas" class="drone-canvas" width="880" height="400"></canvas>
              
              <!-- HUD Overlay -->
              <div class="drone-hud-overlay">
                <div class="drone-hud-top">
                  <div>
                    <div>ALT: 124m &nbsp;|&nbsp; SPD: 42 km/h &nbsp;|&nbsp; HDG: 142° SE</div>
                    <div>BAT: 88% [████████░] &nbsp;|&nbsp; GIMBAL: -45° TILT</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="color: #ff1744; font-weight: 700;">● REC [LIVE_TELEM]</div>
                    <div>FPS: 30.2 &nbsp;|&nbsp; LATENCY: 14ms (EDGE_NPU)</div>
                  </div>
                </div>

                <div class="drone-hud-crosshair"></div>

                <div class="drone-hud-bottom">
                  <div>
                    <div>TARGET REGION: ${scenName}</div>
                    <div id="drone-gps-coords">GPS: ${center[0].toFixed(4)}°N, ${center[1].toFixed(4)}°E (EOC SECTOR 4)</div>
                  </div>
                  <div style="text-align: right;">
                    <div>OPTICAL MODEL: YOLOv8-DISASTER-v2</div>
                    <div style="color: #00e676;">TARGET LOCK: 3 DETECTIONS VERIFIED</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Drone Controls -->
            <div class="drone-controls-row">
              <div class="drone-feed-selector">
                <button class="drone-feed-btn active" id="btn-feed-thermal" onclick="window.DP.Phase2.setDroneFeed('thermal')">
                  🔥 FLIR Thermal IR
                </button>
                <button class="drone-feed-btn" id="btn-feed-optical" onclick="window.DP.Phase2.setDroneFeed('optical')">
                  📷 High-Res Optical RGB
                </button>
                <button class="drone-feed-btn" id="btn-feed-night" onclick="window.DP.Phase2.setDroneFeed('night')">
                  🟢 NVG Night Vision
                </button>
              </div>

              <div style="display: flex; gap: 10px;">
                <button class="btn btn-primary" onclick="window.DP.Phase2.geotagDroneDetection()">
                  📍 Geotag & Pin to Tactical Map
                </button>
                <button class="btn btn-danger" onclick="window.DP.Phase2.dispatchAirHelicopter()">
                  🚁 Dispatch Air Rescue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.initDroneCanvas();
  },

  setDroneFeed(mode) {
    this.droneActiveFeed = mode;
    document.querySelectorAll('.drone-feed-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`btn-feed-${mode}`);
    if (btn) btn.classList.add('active');
  },

  initDroneCanvas() {
    const canvas = document.getElementById('drone-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let scanLineY = 0;

    const render = () => {
      if (!document.getElementById('drone-canvas')) return;

      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw Background Feed Theme
      if (this.droneActiveFeed === 'thermal') {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#090514');
        grad.addColorStop(0.5, '#1e0c2b');
        grad.addColorStop(1, '#0c172e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Thermal hotspots
        ctx.fillStyle = 'rgba(255, 60, 0, 0.45)';
        ctx.beginPath();
        ctx.arc(280, 220, 60, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 230, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(280, 220, 30, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.droneActiveFeed === 'optical') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, w, h);

        // Water/Building shapes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(80, 100, 240, 180);
        ctx.fillRect(400, 80, 300, 220);
      } else {
        // Night vision
        ctx.fillStyle = '#021808';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(0, 255, 100, 0.08)';
        ctx.fillRect(0, 0, w, h);
      }

      // 2. Grid & Target Wireframes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // 3. Scan line animation
      scanLineY = (scanLineY + 2) % h;
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, scanLineY);
      ctx.lineTo(w, scanLineY);
      ctx.stroke();

      // 4. YOLOv8 Simulated Bounding Boxes
      this.drawYOLOBox(ctx, 230, 170, 110, 120, 'SURVIVOR DETECTED', '96.4%', '#00e676');
      this.drawYOLOBox(ctx, 430, 120, 180, 130, 'STRUCTURAL COLLAPSE', '89.1%', '#ff1744');
      this.drawYOLOBox(ctx, 650, 200, 140, 110, 'SUBMERGED ROADWAY', '92.8%', '#ff6d00');

      this.droneAnimFrame = requestAnimationFrame(render);
    };

    if (this.droneAnimFrame) cancelAnimationFrame(this.droneAnimFrame);
    this.droneAnimFrame = requestAnimationFrame(render);
  },

  drawYOLOBox(ctx, x, y, bw, bh, label, conf, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, bw, bh);

    // Corner brackets
    const bLen = 10;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    // Top-left
    ctx.beginPath(); ctx.moveTo(x, y + bLen); ctx.lineTo(x, y); ctx.lineTo(x + bLen, y); ctx.stroke();
    // Top-right
    ctx.beginPath(); ctx.moveTo(x + bw - bLen, y); ctx.lineTo(x + bw, y); ctx.lineTo(x + bw, y + bLen); ctx.stroke();
    // Bottom-left
    ctx.beginPath(); ctx.moveTo(x, y + bh - bLen); ctx.lineTo(x, y + bh); ctx.lineTo(x + bLen, y + bh); ctx.stroke();
    // Bottom-right
    ctx.beginPath(); ctx.moveTo(x + bw - bLen, y + bh); ctx.lineTo(x + bw, y + bh); ctx.lineTo(x + bw, y + bh - bLen); ctx.stroke();

    // Label tag
    ctx.fillStyle = color;
    ctx.fillRect(x, y - 18, ctx.measureText(`${label} ${conf}`).width + 12, 18);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`${label} ${conf}`, x + 6, y - 5);
  },

  geotagDroneDetection() {
    const center = window.DP.App?.selectedScenario?.center || [13.048, 80.268];
    const newInc = {
      id: window.DP.Helpers.uid('drone_inc'),
      type: 'rescue',
      title: 'Drone YOLOv8: 4 Survivors Stranded on Rooftop',
      lat: center[0] + window.DP.Helpers.rand(-0.008, 0.008),
      lng: center[1] + window.DP.Helpers.rand(-0.012, -0.004),
      severity: 4,
      populationAffected: 4,
      magnitude: 7.2,
      infrastructureDamage: 0.8,
      weatherCondition: 0.9,
      status: 'ACTIVE',
      responders: 0,
      timestamp: Date.now(),
      classification: { severityLabel: 'HIGH', protocol: 'Full Regional Mobilization' }
    };

    window.DP.App?.simulator?.incidents?.unshift(newInc);
    window.DP.App?.runAIEngine();
    window.DP.App?.updateUI();

    this.closeModal();
    window.DP.App?.switchView('map');

    if (window.DP.App?.ui?.alerts) {
      window.DP.App.ui.alerts.toast('success', 'Drone Recon Geotagged', 'New survivor cluster added to Live Map. A* evacuation route updated.');
    }
  },

  dispatchAirHelicopter() {
    if (window.DP.App?.ui?.alerts) {
      window.DP.App.ui.alerts.toast('info', 'Air Evacuation Dispatched', 'IAF/Coast Guard Rescue Chopper airborne from staging depot. ETA: 6 mins.');
    }
    this.closeModal();
  },

  // ===== 2. WHISPER AUDIO CALL ANALYZER =====
  whisperPresets: [
    {
      title: 'Call #1: Chennai Coastal Inundation (Velachery)',
      lang: 'English / Tamil',
      duration: '0:18',
      text: "112 emergency! Water has entered the ground floor at Velachery bypass road. Six people are trapped including an elderly cardiac patient. The current is very strong, please dispatch an inflatable rescue boat immediately!",
      entities: { disaster: 'Flash Flooding', location: 'Velachery Bypass, Chennai', trapped: '6 Persons', severity: 'Level 4 (Severe)', triage: 'Full Mobilization' }
    },
    {
      title: 'Call #2: Himalayan Landslide Rupture (NH-58)',
      lang: 'Hindi / Garhwali',
      duration: '0:22',
      text: "कंट्रोल रूम! बद्रीनाथ हाईवे NH-58 पर भारी भूस्खलन हुआ है। दो गाड़ियां मलबे में दब गई हैं, लगभग 8 लोग फंसे हैं। रास्ता पूरी तरह बंद है, तुरंत क्रेन और NDRF रेस्क्यू टीम भेजिए!",
      entities: { disaster: 'Rockfall / Landslide', location: 'NH-58 Km 42, Rishikesh', trapped: '8 Persons', severity: 'Level 5 (Critical)', triage: 'Maximum Response' }
    },
    {
      title: 'Call #3: Jamnagar Petrochemical Gas Plume',
      lang: 'English / Gujarati',
      duration: '0:15',
      text: "Refinery Sector 4 emergency! Chlorine tank valve ruptured. Pungent gas cloud drifting towards residential colony. Workers are suffocating, activate sirens and initiate upwind evacuation immediately!",
      entities: { disaster: 'Toxic Chlorine Leak', location: 'Refinery Gate 3, Jamnagar', trapped: '25+ Workers', severity: 'Level 5 (Critical)', triage: 'HAZMAT Exclusion' }
    }
  ],

  openWhisperModal() {
    this.closeModal();
    const preset = this.whisperPresets[this.activeAudioPreset];

    const modalHtml = `
      <div class="phase2-modal-backdrop" id="phase2-modal-backdrop" onclick="if(event.target===this) window.DP.Phase2.closeModal()">
        <div class="phase2-modal">
          <div class="phase2-modal-header">
            <div class="phase2-modal-title">
              <span>🎙️</span>
              <span>Emergency 112 Ingestion Terminal</span>
              <span class="phase2-badge phase2-badge-whisper">OpenAI Whisper + NLP</span>
            </div>
            <button class="phase2-modal-close" onclick="window.DP.Phase2.closeModal()">✕</button>
          </div>

          <div class="phase2-modal-body">
            <div class="whisper-container">
              <!-- Left: Audio Source Selection -->
              <div class="whisper-audio-panel">
                <div style="font-size: 11px; font-weight: 700; color: #c084fc; text-transform: uppercase;">Incoming Distress Audio Stream</div>
                
                <div class="whisper-presets-list">
                  ${this.whisperPresets.map((p, idx) => `
                    <div class="whisper-preset-card ${idx === this.activeAudioPreset ? 'active' : ''}" onclick="window.DP.Phase2.selectWhisperPreset(${idx})">
                      <div style="font-size: 12px; font-weight: 600; color: var(--text-primary);">${p.title}</div>
                      <div style="font-size: 10px; color: var(--text-muted); margin-top: 3px;">Lang: ${p.lang} • Dur: ${p.duration}</div>
                    </div>
                  `).join('')}
                </div>

                <!-- Waveform Visualizer -->
                <div class="whisper-waveform" id="whisper-waveform">
                  ${Array.from({length: 32}).map(() => `<div class="wave-bar"></div>`).join('')}
                </div>

                <button class="btn btn-primary" onclick="window.DP.Phase2.playAndTranscribe()" id="btn-transcribe">
                  <span>▶ Play & Transcribe Audio</span>
                </button>
              </div>

              <!-- Right: Transcript & Entity Extraction -->
              <div class="whisper-transcript-panel">
                <div style="font-size: 11px; font-weight: 700; color: #00d4ff; text-transform: uppercase;">Real-Time Speech-to-Text & Entity Extraction</div>

                <div class="whisper-live-text" id="whisper-live-text">
                  <span style="color: var(--text-muted); font-style: italic;">Click "Play & Transcribe" to process emergency audio stream with Whisper AI...</span>
                </div>

                <div class="whisper-entity-grid">
                  <div class="whisper-entity-card">
                    <div class="whisper-entity-label">Detected Disaster</div>
                    <div class="whisper-entity-val" id="ent-disaster">${preset.entities.disaster}</div>
                  </div>
                  <div class="whisper-entity-card">
                    <div class="whisper-entity-label">Extracted Location</div>
                    <div class="whisper-entity-val" id="ent-location">${preset.entities.location}</div>
                  </div>
                  <div class="whisper-entity-card">
                    <div class="whisper-entity-label">Reported Victims</div>
                    <div class="whisper-entity-val" id="ent-trapped">${preset.entities.trapped}</div>
                  </div>
                  <div class="whisper-entity-card">
                    <div class="whisper-entity-label">START Triage Protocol</div>
                    <div class="whisper-entity-val" id="ent-triage" style="color: #ff1744;">${preset.entities.severity}</div>
                  </div>
                </div>

                <button class="btn btn-danger" style="margin-top: 6px;" onclick="window.DP.Phase2.dispatchWhisperIncident()">
                  🚨 Auto-Dispatch via Decision Tree & A*
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  selectWhisperPreset(idx) {
    this.activeAudioPreset = idx;
    this.openWhisperModal();
  },

  playAndTranscribe() {
    const textEl = document.getElementById('whisper-live-text');
    const waveEl = document.getElementById('whisper-waveform');
    const btn = document.getElementById('btn-transcribe');
    if (!textEl) return;

    btn.disabled = true;
    btn.innerText = 'Transcribing Speech (Whisper Model)...';

    // Animate waveform
    const bars = waveEl.querySelectorAll('.wave-bar');
    const waveTimer = setInterval(() => {
      bars.forEach(b => {
        b.style.height = `${Math.floor(Math.random() * 45) + 6}px`;
      });
    }, 100);

    // Typewriter effect
    const fullText = this.whisperPresets[this.activeAudioPreset].text;
    textEl.innerHTML = '';
    let charIdx = 0;

    const typeTimer = setInterval(() => {
      if (charIdx < fullText.length) {
        textEl.innerHTML = fullText.substring(0, charIdx + 1) + '<span style="color:#00d4ff;">█</span>';
        charIdx++;
      } else {
        clearInterval(typeTimer);
        clearInterval(waveTimer);
        bars.forEach(b => { b.style.height = '10px'; });
        textEl.innerHTML = fullText + '<br><br><span style="color:#00e676; font-size:11px;">✔ Transcription Verified (Confidence: 98.2%)</span>';
        btn.disabled = false;
        btn.innerText = '✔ Transcription Complete';
      }
    }, 30);
  },

  dispatchWhisperIncident() {
    const preset = this.whisperPresets[this.activeAudioPreset];
    const center = window.DP.App?.selectedScenario?.center || [13.048, 80.268];

    const newInc = {
      id: window.DP.Helpers.uid('call_inc'),
      type: 'flood',
      title: `112 Call: ${preset.entities.location}`,
      lat: center[0] + window.DP.Helpers.rand(-0.015, 0.015),
      lng: center[1] + window.DP.Helpers.rand(-0.020, -0.005),
      severity: 4,
      populationAffected: parseInt(preset.entities.trapped) || 8,
      magnitude: 7.5,
      infrastructureDamage: 0.7,
      weatherCondition: 0.85,
      status: 'ACTIVE',
      responders: 2,
      timestamp: Date.now(),
      classification: { severityLabel: 'HIGH', protocol: preset.entities.triage }
    };

    window.DP.App?.simulator?.incidents?.unshift(newInc);
    window.DP.App?.runAIEngine();
    window.DP.App?.updateUI();

    this.closeModal();
    window.DP.App?.switchView('map');

    if (window.DP.App?.ui?.alerts) {
      window.DP.App.ui.alerts.toast('warning', '112 Call Dispatched', `Emergency at ${preset.entities.location} routed to nearest NDRF battalion via Decision Tree.`);
    }
  },

  // ===== 3. EXECUTIVE SITREP GENERATOR =====
  generateSitrepModal() {
    this.closeModal();

    const scen = window.DP.App?.selectedScenario || { name: 'Cyclone Michaung Landfall', affectedPopulation: 2400000, disasterType: 'hurricane' };
    const stats = window.DP.App?.simulator?.getStats() || { active: 5, deployed: 18, standby: 140, totalPop: 465000 };
    const topThreat = window.DP.App?.ai?.bayesian?.getTopThreat() || { type: scen.disasterType || 'hurricane', probability: 0.994 };
    const nnPred = window.DP.App?.ai?.neuralNet?.lastPrediction || { estimatedCasualties: 55, monetaryLossM: 14.5 };
    const routesCount = window.DP.App?.ai?.astar?.routes?.length || 3;
    const nowStr = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'medium' });

    const modalHtml = `
      <div class="phase2-modal-backdrop" id="phase2-modal-backdrop" onclick="if(event.target===this) window.DP.Phase2.closeModal()">
        <div class="phase2-modal" style="max-width: 860px;">
          <div class="phase2-modal-header">
            <div class="phase2-modal-title">
              <span>📄</span>
              <span>National Disaster Operations Command — Situation Report</span>
              <span class="phase2-badge phase2-badge-sitrep">SITREP #04-FINAL</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save PDF</button>
              <button class="phase2-modal-close" onclick="window.DP.Phase2.closeModal()">✕</button>
            </div>
          </div>

          <div class="phase2-modal-body" style="background: #f1f5f9; padding: 20px;">
            <div class="sitrep-preview-wrap">
              <!-- Official Header -->
              <div class="sitrep-header">
                <div>
                  <div style="font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 1px;">NATIONAL DISASTER MANAGEMENT AUTHORITY (NDMA)</div>
                  <div class="sitrep-title">INCIDENT SITUATION REPORT (SITREP)</div>
                  <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-top: 2px;">OP: ${scen.name.toUpperCase()}</div>
                </div>
                <div class="sitrep-meta">
                  <div><strong>DOC ID:</strong> NDMA-C4ISR-${Date.now().toString().slice(-6)}</div>
                  <div><strong>ISSUED:</strong> ${nowStr}</div>
                  <div><strong>CLASSIFICATION:</strong> RESTRICTED / OPERATIONAL</div>
                </div>
              </div>

              <!-- Top KPIs -->
              <div class="sitrep-grid">
                <div class="sitrep-stat-box">
                  <div class="sitrep-stat-label">Active Incidents</div>
                  <div class="sitrep-stat-val" style="color: #dc2626;">${stats.active} Zones</div>
                </div>
                <div class="sitrep-stat-box">
                  <div class="sitrep-stat-label">Units Deployed</div>
                  <div class="sitrep-stat-val" style="color: #2563eb;">${stats.deployed} Tactical</div>
                </div>
                <div class="sitrep-stat-box">
                  <div class="sitrep-stat-label">Population Exposed</div>
                  <div class="sitrep-stat-val">${(stats.totalPop || scen.affectedPopulation).toLocaleString()}</div>
                </div>
                <div class="sitrep-stat-box">
                  <div class="sitrep-stat-label">Confirmed Threat</div>
                  <div class="sitrep-stat-val" style="color: #7c3aed;">${(topThreat.probability * 100).toFixed(1)}%</div>
                </div>
              </div>

              <!-- Section 1: Algorithmic Syntheses -->
              <div class="sitrep-section-title">1. Automated AI Intelligence Synthesis</div>
              <table class="sitrep-table">
                <thead>
                  <tr>
                    <th>Module</th>
                    <th>Analytical Technique</th>
                    <th>Calculated Result</th>
                    <th>Command Directive</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Threat Network</strong></td>
                    <td>Recursive Bayesian Updating</td>
                    <td>${(topThreat.probability * 100).toFixed(1)}% ${(topThreat.type || scen.disasterType || 'hurricane').toUpperCase()}</td>
                    <td>Elevate State Emergency Operations to Level 5.</td>
                  </tr>
                  <tr>
                    <td><strong>Evacuation Routing</strong></td>
                    <td>Risk-Penalised A* ($\alpha=1000$)</td>
                    <td>${routesCount} Safe Corridors Open</td>
                    <td>Maintain unflooded bypass via Anna Univ & IIT Madras.</td>
                  </tr>
                  <tr>
                    <td><strong>Staging Optimization</strong></td>
                    <td>K-Means++ Geodesic Haversine</td>
                    <td>3 Optimal Staging Hubs</td>
                    <td>Pre-position water pumps & ambulances at Kilpauk & Guindy.</td>
                  </tr>
                  <tr>
                    <td><strong>Damage Projection</strong></td>
                    <td>2-Layer Feed-Forward Neural Net</td>
                    <td>~${nnPred.estimatedCasualties} Casualties / $${nnPred.monetaryLossM}M Loss</td>
                    <td>SDRF/NDRF aid allocation tranche authorized.</td>
                  </tr>
                </tbody>
              </table>

              <!-- Section 2: Resource Fleet Readiness -->
              <div class="sitrep-section-title">2. Operational Resource Fleet Distribution</div>
              <div style="font-size: 11px; line-height: 1.6; color: #334155;">
                • <strong>Ambulance Squads:</strong> 45 Total (18 Active, 27 Staged at Trauma Centers)<br>
                • <strong>Heavy NDRF Rescue Squads:</strong> 20 Battalions deployed along coastal surge perimeter<br>
                • <strong>Air Operations:</strong> 8 IAF Helicopters stationed at Tambaram Air Base on standby<br>
                • <strong>Relief Shelters:</strong> Anna University (Capacity: 12,000) & IIT Madras (Capacity: 8,000) operational
              </div>

              <div style="margin-top: 24px; border-top: 1px dashed #cbd5e1; padding-top: 10px; font-size: 10px; color: #64748b; display: flex; justify-content: space-between;">
                <div>DIGITAL SIGNATURE: <em>SENTINEL_AI_AUTODISPATCH_OFFICER_v2</em></div>
                <div>COMPLIANCE: OASIS CAP v1.2 / NDMA PROTOCOL 2026</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  // ===== 4. CITIZEN SOS / DYNAMIC INCIDENT INJECTOR =====
  openLiveSOSModal() {
    this.closeModal();
    const center = window.DP.App?.selectedScenario?.center || [13.048, 80.268];

    const modalHtml = `
      <div class="phase2-modal-backdrop" id="phase2-modal-backdrop" onclick="if(event.target===this) window.DP.Phase2.closeModal()">
        <div class="phase2-modal" style="max-width: 520px;">
          <div class="phase2-modal-header">
            <div class="phase2-modal-title">
              <span>🚨</span>
              <span>Inject Citizen SOS Incident</span>
              <span class="phase2-badge phase2-badge-sitrep">Live Demo</span>
            </div>
            <button class="phase2-modal-close" onclick="window.DP.Phase2.closeModal()">✕</button>
          </div>

          <div class="phase2-modal-body">
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">
              Inject a live distress call into the simulation. The <strong>START Decision Tree</strong> and <strong>A* Evacuation Router</strong> will immediately recalculate in front of the jury.
            </p>

            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div>
                <label style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Incident Title</label>
                <input type="text" id="sos-title" class="form-input" value="Flash Flood: School Bus Trapped in Underpass" style="width: 100%; margin-top: 4px; padding: 8px 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: var(--r-md); color: #fff;">
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <label style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Magnitude (1-10)</label>
                  <input type="number" id="sos-mag" class="form-input" value="8.5" min="1" max="10" step="0.5" style="width: 100%; margin-top: 4px; padding: 8px 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: var(--r-md); color: #fff;">
                </div>
                <div>
                  <label style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Affected Citizens</label>
                  <input type="number" id="sos-pop" class="form-input" value="45" min="1" style="width: 100%; margin-top: 4px; padding: 8px 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: var(--r-md); color: #fff;">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <label style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Latitude</label>
                  <input type="text" id="sos-lat" class="form-input" value="${(center[0] + 0.005).toFixed(4)}" style="width: 100%; margin-top: 4px; padding: 8px 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: var(--r-md); color: #fff;">
                </div>
                <div>
                  <label style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Longitude</label>
                  <input type="text" id="sos-lng" class="form-input" value="${(center[1] - 0.012).toFixed(4)}" style="width: 100%; margin-top: 4px; padding: 8px 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: var(--r-md); color: #fff;">
                </div>
              </div>

              <button class="btn btn-danger" style="margin-top: 8px;" onclick="window.DP.Phase2.executeLiveSOS()">
                ⚡ Inject SOS & Recalculate AI Pipeline
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  executeLiveSOS() {
    const title = document.getElementById('sos-title')?.value || 'Emergency SOS Distress';
    const mag = parseFloat(document.getElementById('sos-mag')?.value) || 8.0;
    const pop = parseInt(document.getElementById('sos-pop')?.value) || 20;
    const lat = parseFloat(document.getElementById('sos-lat')?.value) || 13.048;
    const lng = parseFloat(document.getElementById('sos-lng')?.value) || 80.260;

    const newInc = {
      id: window.DP.Helpers.uid('live_sos'),
      type: 'flood',
      title: title,
      lat: lat,
      lng: lng,
      severity: mag >= 8 ? 5 : (mag >= 6 ? 4 : 3),
      populationAffected: pop,
      magnitude: mag,
      infrastructureDamage: 0.75,
      weatherCondition: 0.9,
      status: 'ACTIVE',
      responders: 0,
      timestamp: Date.now()
    };

    // 1. Ingest incident
    window.DP.App?.simulator?.incidents?.unshift(newInc);

    // 2. Re-evaluate Decision Tree, A*, K-Means, Neural Net
    window.DP.App?.runAIEngine();
    window.DP.App?.updateUI();

    this.closeModal();
    window.DP.App?.switchView('map');

    if (window.DP.App?.ui?.alerts) {
      window.DP.App.ui.alerts.toast('danger', 'Live SOS Registered!', `Classified as LEVEL ${newInc.severity} ${newInc.severity >= 5 ? 'CRITICAL' : 'HIGH'}. A* avoidance corridors recalculated.`);
    }
  },

  closeModal() {
    if (this.droneAnimFrame) cancelAnimationFrame(this.droneAnimFrame);
    if (this.whisperInterval) clearInterval(this.whisperInterval);
    const existing = document.getElementById('phase2-modal-backdrop');
    if (existing) existing.remove();
  }
};
