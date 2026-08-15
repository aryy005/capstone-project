window.DP = window.DP || {};

/**
 * AStarRouter - A* Pathfinding for Evacuation Route Optimization
 * f(n) = g(n) + h(n)
 * g(n) = actual cost from start to n
 * h(n) = heuristic estimate from n to goal (Euclidean)
 * Dynamic hazard weighting: W(e) = Distance(e) * (1 + α * RiskLevel(e))
 */
window.DP.AStarRouter = class {
  constructor(gridSize = 50) {
    this.gridSize = gridSize;
    this.HAZARD_PENALTY = 1000;
    this.routes = [];
  }

  // Convert lat/lng to grid cell
  latLngToCell(lat, lng, bounds) {
    const row = Math.floor(((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * this.gridSize);
    const col = Math.floor(((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * this.gridSize);
    return { row: window.DP.Helpers.clamp(row, 0, this.gridSize-1), col: window.DP.Helpers.clamp(col, 0, this.gridSize-1) };
  }

  // Convert grid cell back to lat/lng
  cellToLatLng(row, col, bounds) {
    const lat = bounds.minLat + (row / this.gridSize) * (bounds.maxLat - bounds.minLat);
    const lng = bounds.minLng + (col / this.gridSize) * (bounds.maxLng - bounds.minLng);
    return [lat, lng];
  }

  // Build hazard grid from incident/hazard data
  buildHazardGrid(hazards, bounds) {
    const grid = Array.from({ length: this.gridSize }, () => new Float32Array(this.gridSize));
    hazards.forEach(h => {
      const center = this.latLngToCell(h.lat, h.lng, bounds);
      const radiusCells = Math.ceil((h.radiusKm / 111) / ((bounds.maxLat - bounds.minLat) / this.gridSize));
      for (let r = Math.max(0, center.row - radiusCells); r < Math.min(this.gridSize, center.row + radiusCells); r++) {
        for (let c = Math.max(0, center.col - radiusCells); c < Math.min(this.gridSize, center.col + radiusCells); c++) {
          const dist = Math.sqrt(Math.pow(r - center.row, 2) + Math.pow(c - center.col, 2));
          if (dist <= radiusCells) {
            const risk = (1 - dist / radiusCells) * h.severity;
            grid[r][c] = Math.min(1, grid[r][c] + risk);
          }
        }
      }
    });
    return grid;
  }

  // Heuristic: Euclidean distance
  heuristic(r1, c1, r2, c2) {
    return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(c2 - c1, 2));
  }

  // A* search
  findPath(startLatLng, goalLatLng, hazards, bounds) {
    const start = this.latLngToCell(startLatLng[0], startLatLng[1], bounds);
    const goal = this.latLngToCell(goalLatLng[0], goalLatLng[1], bounds);
    const hazardGrid = this.buildHazardGrid(hazards, bounds);

    const key = (r, c) => r * this.gridSize + c;
    const openSet = new Map();
    const gScore = {};
    const fScore = {};
    const cameFrom = {};

    const startKey = key(start.row, start.col);
    gScore[startKey] = 0;
    fScore[startKey] = this.heuristic(start.row, start.col, goal.row, goal.col);
    openSet.set(startKey, { row: start.row, col: start.col });

    const neighbors = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];

    let iterations = 0;
    while (openSet.size > 0 && iterations < 5000) {
      iterations++;

      // Find node in openSet with lowest fScore
      let current = null, currentKey = null, minF = Infinity;
      openSet.forEach((node, k) => {
        const f = fScore[k] !== undefined ? fScore[k] : Infinity;
        if (f < minF) { minF = f; current = node; currentKey = k; }
      });

      if (current.row === goal.row && current.col === goal.col) {
        return this._reconstructPath(cameFrom, currentKey, bounds);
      }

      openSet.delete(currentKey);

      neighbors.forEach(([dr, dc]) => {
        const nr = current.row + dr, nc = current.col + dc;
        if (nr < 0 || nr >= this.gridSize || nc < 0 || nc >= this.gridSize) return;

        const neighborKey = key(nr, nc);
        const moveCost = (Math.abs(dr) + Math.abs(dc) === 2) ? Math.SQRT2 : 1;
        const hazardCost = hazardGrid[nr][nc] * this.HAZARD_PENALTY;
        const tentativeG = (gScore[currentKey] || 0) + moveCost + hazardCost;

        if (tentativeG < (gScore[neighborKey] !== undefined ? gScore[neighborKey] : Infinity)) {
          cameFrom[neighborKey] = currentKey;
          gScore[neighborKey] = tentativeG;
          fScore[neighborKey] = tentativeG + this.heuristic(nr, nc, goal.row, goal.col);
          openSet.set(neighborKey, { row: nr, col: nc });
        }
      });
    }

    return null; // No path found
  }

  _reconstructPath(cameFrom, currentKey, bounds) {
    const path = [];
    let key = currentKey;
    while (key !== undefined) {
      const row = Math.floor(key / this.gridSize);
      const col = key % this.gridSize;
      path.unshift(this.cellToLatLng(row, col, bounds));
      key = cameFrom[key];
    }
    return this._smoothPath(path);
  }

  // Simple path smoothing - reduce points
  _smoothPath(path) {
    if (path.length <= 2) return path;
    const smoothed = [path[0]];
    const step = Math.max(1, Math.floor(path.length / 20));
    for (let i = step; i < path.length - 1; i += step) smoothed.push(path[i]);
    smoothed.push(path[path.length - 1]);
    return smoothed;
  }

  // Generate multiple evacuation corridors
  generateEvacuationCorridors(evacuationPoints, safeZones, hazards, bounds) {
    const routes = [];
    evacuationPoints.forEach((ep, i) => {
      const targetZone = safeZones[i % safeZones.length];
      const path = this.findPath([ep.lat, ep.lng], [targetZone.lat, targetZone.lng], hazards, bounds);
      if (path) {
        const dist = this._pathDistance(path);
        routes.push({
          id: window.DP.Helpers.uid('route'),
          from: ep,
          to: targetZone,
          path,
          distanceKm: dist.toFixed(1),
          estimatedMinutes: Math.round(dist / 0.8), // ~48 km/h avg speed
          riskScore: hazards.length > 0 ? window.DP.Helpers.rand(0.1, 0.6) : 0.1,
          color: this._routeColor(i)
        });
      }
    });
    this.routes = routes;
    return routes;
  }

  _pathDistance(path) {
    let dist = 0;
    for (let i = 1; i < path.length; i++) {
      dist += window.DP.Helpers.haversineDistance(path[i-1][0], path[i-1][1], path[i][0], path[i][1]);
    }
    return dist;
  }

  _routeColor(i) {
    const colors = ['#00e676', '#40c4ff', '#ffd600', '#ff6d00', '#e040fb'];
    return colors[i % colors.length];
  }
};
