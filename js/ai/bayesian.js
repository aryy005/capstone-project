window.DP = window.DP || {};

/**
 * BayesianThreatNetwork
 * Calculates posterior probabilities of disaster threats using Bayes' theorem
 * P(Disaster | Evidence) ∝ P(Evidence | Disaster) * P(Disaster)
 */
window.DP.BayesianThreatNetwork = class {
  constructor() {
    // Default baseline prior probabilities across disaster categories
    this.defaultPriors = {
      hurricane:  0.08,
      earthquake: 0.06,
      wildfire:   0.10,
      flood:      0.15,
      chemical:   0.08,
      tsunami:    0.03,
      tornado:    0.06
    };
    this.priors = { ...this.defaultPriors };

    // Likelihood tables: P(evidence_level | disaster_type)
    // Discretized levels: [0: low (<0.25), 1: moderate (0.25-0.50), 2: high (0.50-0.75), 3: extreme (>=0.75)]
    this.likelihoods = {
      windSpeed: {
        hurricane:  [0.001, 0.010, 0.150, 0.839],
        earthquake: [0.750, 0.200, 0.045, 0.005],
        wildfire:   [0.050, 0.200, 0.600, 0.150],
        flood:      [0.350, 0.450, 0.180, 0.020],
        chemical:   [0.250, 0.600, 0.140, 0.010],
        tsunami:    [0.400, 0.350, 0.200, 0.050],
        tornado:    [0.001, 0.020, 0.200, 0.779]
      },
      rainfall: {
        hurricane:  [0.001, 0.020, 0.200, 0.779],
        earthquake: [0.700, 0.220, 0.070, 0.010],
        wildfire:   [0.850, 0.130, 0.019, 0.001],
        flood:      [0.001, 0.020, 0.250, 0.729],
        chemical:   [0.700, 0.250, 0.040, 0.010],
        tsunami:    [0.450, 0.350, 0.150, 0.050],
        tornado:    [0.100, 0.300, 0.450, 0.150]
      },
      seismicActivity: {
        hurricane:  [0.900, 0.080, 0.019, 0.001],
        earthquake: [0.001, 0.010, 0.080, 0.909],
        wildfire:   [0.920, 0.070, 0.009, 0.001],
        flood:      [0.900, 0.080, 0.019, 0.001],
        chemical:   [0.950, 0.040, 0.009, 0.001],
        tsunami:    [0.050, 0.150, 0.400, 0.400],
        tornado:    [0.900, 0.080, 0.019, 0.001]
      },
      temperature: {
        hurricane:  [0.100, 0.300, 0.500, 0.100],
        earthquake: [0.300, 0.400, 0.250, 0.050],
        wildfire:   [0.001, 0.020, 0.200, 0.779],
        flood:      [0.250, 0.450, 0.250, 0.050],
        chemical:   [0.150, 0.450, 0.350, 0.050],
        tsunami:    [0.300, 0.400, 0.250, 0.050],
        tornado:    [0.050, 0.250, 0.450, 0.250]
      },
      humidity: {
        hurricane:  [0.001, 0.010, 0.150, 0.839],
        earthquake: [0.350, 0.350, 0.250, 0.050],
        wildfire:   [0.850, 0.130, 0.019, 0.001],
        flood:      [0.001, 0.010, 0.180, 0.809],
        chemical:   [0.150, 0.650, 0.180, 0.020],
        tsunami:    [0.150, 0.350, 0.350, 0.150],
        tornado:    [0.100, 0.300, 0.400, 0.200]
      },
      incidentReports: {
        hurricane:  [0.010, 0.050, 0.250, 0.690],
        earthquake: [0.010, 0.050, 0.250, 0.690],
        wildfire:   [0.010, 0.050, 0.250, 0.690],
        flood:      [0.010, 0.050, 0.250, 0.690],
        chemical:   [0.010, 0.050, 0.250, 0.690],
        tsunami:    [0.010, 0.050, 0.250, 0.690],
        tornado:    [0.010, 0.050, 0.250, 0.690]
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

  // Run Bayesian inference given current evidence telemetry and optional active emergency context
  infer(evidence, activeDisasterType = null) {
    const disasterTypes = Object.keys(this.defaultPriors);
    const unnormalized = {};
    let total = 0;

    // Dynamically adjust operational prior when a declared emergency context exists
    const activePriors = {};
    if (activeDisasterType && this.defaultPriors[activeDisasterType.toLowerCase()]) {
      const activeKey = activeDisasterType.toLowerCase();
      const remainingWeight = 0.18;
      const otherTypes = disasterTypes.filter(d => d !== activeKey);
      activePriors[activeKey] = 0.82;
      otherTypes.forEach(d => {
        activePriors[d] = remainingWeight / otherTypes.length;
      });
    } else {
      Object.assign(activePriors, this.defaultPriors);
    }
    this.priors = activePriors;

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

    // Calculate overall threat level (0-1) reflecting primary hazard severity
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
    const topThreat = this.getTopThreat();
    const topProb = topThreat ? topThreat.probability : 0.5;
    const maxVal = Math.max(
      evidence.windSpeed || 0,
      evidence.rainfall || 0,
      evidence.seismicActivity || 0,
      evidence.temperature || 0,
      evidence.incidentReports || 0
    );
    // Overall threat is weighted combination of Bayesian posterior confidence and peak hazard telemetry
    const threat = Math.min(0.998, Math.max(0.08, (topProb * 0.70) + (maxVal * 0.30)));
    return window.DP.Helpers ? window.DP.Helpers.clamp(threat, 0, 1) : threat;
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
