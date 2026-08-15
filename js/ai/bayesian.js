window.DP = window.DP || {};

/**
 * BayesianThreatNetwork
 * Calculates posterior probabilities of disaster threats using Bayes' theorem
 * P(Disaster | Evidence) ∝ P(Evidence | Disaster) * P(Disaster)
 */
window.DP.BayesianThreatNetwork = class {
  constructor() {
    // Prior probabilities for each disaster type
    this.priors = {
      hurricane:  0.08,
      earthquake: 0.06,
      wildfire:   0.10,
      flood:      0.15,
      chemical:   0.04,
      tsunami:    0.03,
      tornado:    0.07
    };

    // Likelihood tables: P(evidence_level | disaster_type)
    // Each entry: [P(low), P(moderate), P(high), P(extreme)]
    this.likelihoods = {
      windSpeed: {
        hurricane:  [0.01, 0.05, 0.25, 0.69],
        earthquake: [0.60, 0.25, 0.10, 0.05],
        wildfire:   [0.10, 0.30, 0.40, 0.20],
        flood:      [0.20, 0.35, 0.30, 0.15],
        chemical:   [0.50, 0.30, 0.15, 0.05],
        tsunami:    [0.40, 0.30, 0.20, 0.10],
        tornado:    [0.02, 0.08, 0.30, 0.60]
      },
      rainfall: {
        hurricane:  [0.02, 0.08, 0.25, 0.65],
        earthquake: [0.50, 0.30, 0.15, 0.05],
        wildfire:   [0.60, 0.30, 0.08, 0.02],
        flood:      [0.05, 0.10, 0.30, 0.55],
        chemical:   [0.40, 0.35, 0.20, 0.05],
        tsunami:    [0.45, 0.30, 0.15, 0.10],
        tornado:    [0.15, 0.30, 0.35, 0.20]
      },
      seismicActivity: {
        hurricane:  [0.70, 0.20, 0.08, 0.02],
        earthquake: [0.02, 0.08, 0.30, 0.60],
        wildfire:   [0.75, 0.18, 0.05, 0.02],
        flood:      [0.65, 0.22, 0.10, 0.03],
        chemical:   [0.70, 0.20, 0.07, 0.03],
        tsunami:    [0.05, 0.15, 0.35, 0.45],
        tornado:    [0.70, 0.20, 0.08, 0.02]
      },
      temperature: {
        hurricane:  [0.10, 0.20, 0.40, 0.30],
        earthquake: [0.25, 0.35, 0.25, 0.15],
        wildfire:   [0.02, 0.08, 0.30, 0.60],
        flood:      [0.20, 0.35, 0.30, 0.15],
        chemical:   [0.25, 0.30, 0.25, 0.20],
        tsunami:    [0.25, 0.35, 0.25, 0.15],
        tornado:    [0.05, 0.15, 0.40, 0.40]
      },
      humidity: {
        hurricane:  [0.03, 0.07, 0.25, 0.65],
        earthquake: [0.25, 0.35, 0.25, 0.15],
        wildfire:   [0.55, 0.30, 0.12, 0.03],
        flood:      [0.05, 0.15, 0.30, 0.50],
        chemical:   [0.30, 0.35, 0.25, 0.10],
        tsunami:    [0.20, 0.30, 0.30, 0.20],
        tornado:    [0.10, 0.20, 0.40, 0.30]
      },
      incidentReports: {
        hurricane:  [0.05, 0.10, 0.30, 0.55],
        earthquake: [0.05, 0.10, 0.25, 0.60],
        wildfire:   [0.05, 0.10, 0.30, 0.55],
        flood:      [0.05, 0.10, 0.30, 0.55],
        chemical:   [0.10, 0.20, 0.35, 0.35],
        tsunami:    [0.05, 0.10, 0.25, 0.60],
        tornado:    [0.05, 0.10, 0.30, 0.55]
      }
    };

    this.posteriors = {};
    this.threatHistory = [];
    this.overallThreatLevel = 0;
  }

  // Discretize a 0-1 value into 4 levels [low, moderate, high, extreme]
  discretize(value) {
    if (value < 0.25) return 0;
    if (value < 0.50) return 1;
    if (value < 0.75) return 2;
    return 3;
  }

  // Run inference given current evidence
  infer(evidence) {
    const disasterTypes = Object.keys(this.priors);
    const unnormalized = {};
    let total = 0;

    disasterTypes.forEach(disaster => {
      let prob = this.priors[disaster];

      // Multiply by each evidence likelihood
      Object.keys(evidence).forEach(evidenceKey => {
        if (this.likelihoods[evidenceKey]) {
          const level = this.discretize(evidence[evidenceKey]);
          prob *= this.likelihoods[evidenceKey][disaster][level];
        }
      });

      unnormalized[disaster] = prob;
      total += prob;
    });

    // Normalize posteriors
    disasterTypes.forEach(disaster => {
      this.posteriors[disaster] = total > 0 ? unnormalized[disaster] / total : this.priors[disaster];
    });

    // Calculate overall threat level (0-1)
    this.overallThreatLevel = this._calculateOverallThreat(evidence);

    // Store in history
    this.threatHistory.push({
      time: Date.now(),
      level: this.overallThreatLevel,
      topThreat: this.getTopThreat()
    });
    if (this.threatHistory.length > 60) this.threatHistory.shift();

    return this.posteriors;
  }

  _calculateOverallThreat(evidence) {
    const weights = { windSpeed: 0.20, rainfall: 0.18, seismicActivity: 0.22, temperature: 0.12, humidity: 0.13, incidentReports: 0.15 };
    let threat = 0;
    let totalWeight = 0;
    Object.keys(weights).forEach(key => {
      if (evidence[key] !== undefined) {
        threat += evidence[key] * weights[key];
        totalWeight += weights[key];
      }
    });
    return totalWeight > 0 ? window.DP.Helpers.clamp(threat / totalWeight, 0, 1) : 0;
  }

  getTopThreat() {
    let top = null, maxProb = 0;
    Object.keys(this.posteriors).forEach(d => {
      if (this.posteriors[d] > maxProb) { maxProb = this.posteriors[d]; top = d; }
    });
    return { type: top, probability: maxProb };
  }

  getThreatLabel() {
    const t = this.overallThreatLevel;
    if (t < 0.20) return 'MINIMAL';
    if (t < 0.40) return 'LOW';
    if (t < 0.60) return 'MODERATE';
    if (t < 0.80) return 'HIGH';
    return 'CRITICAL';
  }

  getSortedThreats() {
    return Object.entries(this.posteriors)
      .sort((a, b) => b[1] - a[1])
      .map(([type, prob]) => ({ type, probability: prob, percentage: (prob * 100).toFixed(1) }));
  }

  getConfidenceScore() {
    const sorted = this.getSortedThreats();
    if (sorted.length < 2) return 100;
    return Math.round((sorted[0].probability - sorted[1].probability) * 100);
  }
};
