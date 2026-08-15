window.DP = window.DP || {};

/**
 * KMeansClusterer
 * K-Means++ clustering with Haversine distance for resource staging
 * Minimizes WCSS: J = Σ Σ d(x, μi)²
 */
window.DP.KMeansClusterer = class {
  constructor() {
    this.clusters = [];
    this.centroids = [];
    this.iterations = 0;
  }

  // K-Means++ initialization
  _initCentroids(points, k) {
    const centroids = [points[Math.floor(Math.random() * points.length)]];
    while (centroids.length < k) {
      const distances = points.map(p => {
        const minDist = Math.min(...centroids.map(c =>
          window.DP.Helpers.haversineDistance(p.lat, p.lng, c.lat, c.lng)
        ));
        return minDist * minDist;
      });
      const total = distances.reduce((a, b) => a + b, 0);
      let rand = Math.random() * total;
      for (let i = 0; i < distances.length; i++) {
        rand -= distances[i];
        if (rand <= 0) { centroids.push(points[i]); break; }
      }
    }
    return centroids.map(c => ({ lat: c.lat, lng: c.lng }));
  }

  // Assign each point to nearest centroid
  _assignClusters(points, centroids) {
    return points.map(p => {
      let minDist = Infinity, clusterIdx = 0;
      centroids.forEach((c, i) => {
        const dist = window.DP.Helpers.haversineDistance(p.lat, p.lng, c.lat, c.lng);
        if (dist < minDist) { minDist = dist; clusterIdx = i; }
      });
      return { ...p, cluster: clusterIdx, distToCentroid: minDist };
    });
  }

  // Recompute centroids as mean of assigned points
  _updateCentroids(points, k, assignments) {
    const newCentroids = Array.from({ length: k }, () => ({ lat: 0, lng: 0, count: 0 }));
    assignments.forEach((a, i) => {
      newCentroids[a.cluster].lat += points[i].lat;
      newCentroids[a.cluster].lng += points[i].lng;
      newCentroids[a.cluster].count++;
    });
    return newCentroids.map((c, i) => {
      if (c.count === 0) return this.centroids[i]; // Keep old centroid if no points
      return { lat: c.lat / c.count, lng: c.lng / c.count };
    });
  }

  // Check convergence
  _hasConverged(old, newC, tol = 0.0001) {
    return old.every((c, i) =>
      Math.abs(c.lat - newC[i].lat) < tol && Math.abs(c.lng - newC[i].lng) < tol
    );
  }

  // Main clustering
  cluster(points, k, maxIter = 100) {
    if (points.length === 0) return { centroids: [], clusters: [], wcss: 0 };
    k = Math.min(k, points.length);

    this.centroids = this._initCentroids(points, k);
    let assignments = [];
    this.iterations = 0;

    for (let iter = 0; iter < maxIter; iter++) {
      this.iterations++;
      assignments = this._assignClusters(points, this.centroids);
      const newCentroids = this._updateCentroids(points, k, assignments);
      if (this._hasConverged(this.centroids, newCentroids)) break;
      this.centroids = newCentroids;
    }

    // Build final cluster objects
    this.clusters = Array.from({ length: k }, (_, i) => {
      const clusterPoints = assignments.filter(p => p.cluster === i);
      const totalSeverity = clusterPoints.reduce((s, p) => s + (p.severity || 1), 0);
      return {
        id: i,
        centroid: this.centroids[i],
        points: clusterPoints,
        size: clusterPoints.length,
        totalSeverity,
        avgDistance: clusterPoints.length > 0
          ? clusterPoints.reduce((s, p) => s + p.distToCentroid, 0) / clusterPoints.length
          : 0,
        recommendedResources: this._recommendResources(totalSeverity, clusterPoints.length)
      };
    });

    const wcss = assignments.reduce((s, p) => s + p.distToCentroid * p.distToCentroid, 0);
    return { centroids: this.centroids, clusters: this.clusters, wcss, iterations: this.iterations };
  }

  _recommendResources(severity, incidentCount) {
    const base = Math.ceil(incidentCount * 0.5);
    return {
      ambulances: Math.max(1, Math.ceil(severity * 0.4)),
      fireEngines: Math.max(1, Math.ceil(severity * 0.3)),
      rescueTeams: Math.max(1, Math.ceil(incidentCount * 0.3)),
      medicalUnits: Math.max(1, Math.ceil(severity * 0.2)),
      total: base + Math.ceil(severity * 0.5)
    };
  }

  // Elbow method: find optimal K
  findOptimalK(points, maxK = 8) {
    const results = [];
    for (let k = 1; k <= Math.min(maxK, points.length); k++) {
      const { wcss } = this.cluster(points, k);
      results.push({ k, wcss });
    }
    // Find elbow point
    let optimalK = 3;
    let maxDrop = 0;
    for (let i = 1; i < results.length - 1; i++) {
      const drop = results[i-1].wcss - results[i].wcss;
      const nextDrop = results[i].wcss - results[i+1].wcss;
      if (drop - nextDrop > maxDrop) { maxDrop = drop - nextDrop; optimalK = results[i].k; }
    }
    return { optimalK, wcssByK: results };
  }
};
