window.DP = window.DP || {};

/**
 * MonteCarloPredictor
 * Runs N simulations to model disaster spread probabilities
 * Uses cellular automaton + stochastic environmental parameters
 */
window.DP.MonteCarloPredictor = class {
  constructor(runs = 1000) {
    this.runs = runs;
    this.gridSize = 40;
    this.results = null;
    this.isRunning = false;
  }

  // Sample from gaussian distribution
  _gaussian(mean, std) { return window.DP.Helpers.randGaussian(mean, std); }

  // Wildfire spread simulation (single run)
  _simulateWildfire(params, steps = 20) {
    const grid = Array.from({ length: this.gridSize }, () => new Uint8Array(this.gridSize));
    const cx = Math.floor(this.gridSize / 2), cy = Math.floor(this.gridSize / 2);
    grid[cx][cy] = 1; // ignition point

    const windSpeed = this._gaussian(params.windSpeed, 0.1);
    const humidity  = this._gaussian(params.humidity,  0.05);
    const windDir   = this._gaussian(params.windDir,   0.2);
    const spreadProb = window.DP.Helpers.clamp(windSpeed * (1 - humidity) * 0.8, 0.05, 0.95);

    for (let step = 0; step < steps; step++) {
      const newGrid = grid.map(row => new Uint8Array(row));
      for (let r = 1; r < this.gridSize - 1; r++) {
        for (let c = 1; c < this.gridSize - 1; c++) {
          if (grid[r][c] === 1) {
            const neighbors = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1],[-1,1],[1,-1]];
            neighbors.forEach(([dr, dc]) => {
              if (grid[r+dr]?.[c+dc] === 0) {
                // Wind direction bias
                const alignment = (dr * Math.sin(windDir) + dc * Math.cos(windDir)) * 0.3;
                const prob = window.DP.Helpers.clamp(spreadProb + alignment, 0, 1);
                if (Math.random() < prob) newGrid[r+dr][c+dc] = 1;
              }
            });
          }
        }
      }
      for (let r = 0; r < this.gridSize; r++) grid[r] = newGrid[r];
    }
    return grid;
  }

  // Flood spread simulation (single run)
  _simulateFlood(params, steps = 15) {
    const grid = Array.from({ length: this.gridSize }, () => new Float32Array(this.gridSize));
    const cx = Math.floor(this.gridSize / 2), cy = Math.floor(this.gridSize / 2);
    const rainfall = this._gaussian(params.rainfall, 0.08);
    const elevation = params.elevation || (() => {
      const e = Array.from({ length: this.gridSize }, (_, r) =>
        Array.from({ length: this.gridSize }, (_, c) => {
          const dr = r - cx, dc = c - cy;
          return window.DP.Helpers.clamp(Math.sqrt(dr*dr + dc*dc) / this.gridSize + window.DP.Helpers.rand(-0.1, 0.1), 0, 1);
        })
      );
      return (r, c) => e[r][c];
    })();

    grid[cx][cy] = rainfall;
    for (let step = 0; step < steps; step++) {
      const newGrid = grid.map(row => new Float32Array(row));
      for (let r = 1; r < this.gridSize - 1; r++) {
        for (let c = 1; c < this.gridSize - 1; c++) {
          if (grid[r][c] > 0.05) {
            const neighbors = [[-1,0],[1,0],[0,-1],[0,1]];
            neighbors.forEach(([dr, dc]) => {
              const nr = r+dr, nc = c+dc;
              const elev = elevation(nr, nc);
              const flow = grid[r][c] * (1 - elev) * 0.4;
              newGrid[nr][nc] = Math.min(1, newGrid[nr][nc] + flow);
            });
          }
        }
      }
      for (let r = 0; r < this.gridSize; r++) grid[r] = newGrid[r];
    }
    return grid;
  }

  // Earthquake damage estimation (single run)
  _simulateEarthquake(params, steps = 5) {
    const grid = Array.from({ length: this.gridSize }, () => new Float32Array(this.gridSize));
    const cx = Math.floor(this.gridSize / 2), cy = Math.floor(this.gridSize / 2);
    const magnitude = this._gaussian(params.magnitude, 0.2);
    const soilType  = this._gaussian(params.soilSoftness || 0.5, 0.1);

    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        const dist = Math.sqrt(Math.pow(r-cx, 2) + Math.pow(c-cy, 2));
        const attenuation = 1 / (1 + dist * 0.15);
        const shakingIntensity = magnitude * attenuation * (0.5 + soilType * 0.5);
        grid[r][c] = window.DP.Helpers.clamp(shakingIntensity * window.DP.Helpers.rand(0.7, 1.3), 0, 1);
      }
    }
    return grid;
  }

  // Aggregate N simulation runs into probability grid
  _aggregateRuns(runGrids) {
    const probGrid = Array.from({ length: this.gridSize }, () => new Float32Array(this.gridSize));
    runGrids.forEach(grid => {
      for (let r = 0; r < this.gridSize; r++) {
        for (let c = 0; c < this.gridSize; c++) {
          probGrid[r][c] += (grid[r]?.[c] > 0 || grid[r]?.[c] > 0.05) ? 1 : 0;
        }
      }
    });
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        probGrid[r][c] /= runGrids.length;
      }
    }
    return probGrid;
  }

  // Run full Monte Carlo simulation
  run(disasterType, params, centerLatLng, bounds) {
    this.isRunning = true;
    const runGrids = [];
    const simCount = Math.min(this.runs, 500); // cap for browser performance

    for (let i = 0; i < simCount; i++) {
      let grid;
      switch (disasterType) {
        case 'wildfire':   grid = this._simulateWildfire(params);   break;
        case 'flood':      grid = this._simulateFlood(params);      break;
        case 'earthquake': grid = this._simulateEarthquake(params); break;
        default:           grid = this._simulateWildfire(params);
      }
      runGrids.push(grid);
    }

    const probGrid = this._aggregateRuns(runGrids);
    this.results = {
      probGrid,
      disasterType,
      runs: simCount,
      centerLatLng,
      bounds,
      heatmapPoints: this._toHeatmapPoints(probGrid, centerLatLng, bounds),
      confidenceZones: this._getConfidenceZones(probGrid, centerLatLng, bounds),
      maxProbability: this._maxProb(probGrid),
      timestamp: Date.now()
    };

    this.isRunning = false;
    return this.results;
  }

  _toHeatmapPoints(probGrid, center, bounds) {
    const points = [];
    const latRange = bounds ? (bounds.maxLat - bounds.minLat) : 4;
    const lngRange = bounds ? (bounds.maxLng - bounds.minLng) : 4;
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        const prob = probGrid[r][c];
        if (prob > 0.1) {
          const lat = (bounds ? bounds.minLat : center[0] - 2) + (r / this.gridSize) * latRange;
          const lng = (bounds ? bounds.minLng : center[1] - 2) + (c / this.gridSize) * lngRange;
          points.push([lat, lng, prob]);
        }
      }
    }
    return points;
  }

  _getConfidenceZones(probGrid, center, bounds) {
    const latRange = bounds ? (bounds.maxLat - bounds.minLat) : 4;
    const lngRange = bounds ? (bounds.maxLng - bounds.minLng) : 4;
    const zones = [
      { threshold: 0.9, label: '90% probability', color: '#ff1744', cells: [] },
      { threshold: 0.7, label: '70% probability', color: '#ff6d00', cells: [] },
      { threshold: 0.5, label: '50% probability', color: '#ffd600', cells: [] }
    ];
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        const p = probGrid[r][c];
        const lat = (bounds ? bounds.minLat : center[0] - 2) + (r / this.gridSize) * latRange;
        const lng = (bounds ? bounds.minLng : center[1] - 2) + (c / this.gridSize) * lngRange;
        zones.forEach(z => { if (p >= z.threshold) z.cells.push([lat, lng]); });
      }
    }
    return zones;
  }

  _maxProb(grid) {
    let max = 0;
    grid.forEach(row => row.forEach(v => { if (v > max) max = v; }));
    return max;
  }
};
