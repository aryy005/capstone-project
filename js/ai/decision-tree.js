window.DP = window.DP || {};

/**
 * SeverityClassifier - Decision Tree for Incident Triage
 * Classifies incidents into 5 severity levels using multi-factor decision tree
 * Based on START triage protocol + structural damage assessment
 */
window.DP.SeverityClassifier = class {
  constructor() {
    // Decision tree nodes: each node is a condition check
    this.tree = this._buildTree();
    this.classificationHistory = [];
  }

  _buildTree() {
    return {
      feature: 'magnitude',
      thresholds: [2, 4, 6, 8],
      children: {
        '0': { // magnitude < 2
          feature: 'populationAffected',
          thresholds: [100],
          children: {
            '0': { label: 1, description: 'Minimal Impact', protocol: 'Monitor' },
            '1': { label: 2, description: 'Minor Incident', protocol: 'Standard Response' }
          }
        },
        '1': { // 2 <= magnitude < 4
          feature: 'infrastructureDamage',
          thresholds: [0.3],
          children: {
            '0': { label: 2, description: 'Minor Incident', protocol: 'Standard Response' },
            '1': { label: 3, description: 'Moderate Emergency', protocol: 'Enhanced Response' }
          }
        },
        '2': { // 4 <= magnitude < 6
          feature: 'populationAffected',
          thresholds: [1000],
          children: {
            '0': { label: 3, description: 'Moderate Emergency', protocol: 'Enhanced Response' },
            '1': {
              feature: 'weatherCondition',
              thresholds: [0.5],
              children: {
                '0': { label: 3, description: 'Moderate Emergency', protocol: 'Enhanced Response' },
                '1': { label: 4, description: 'Severe Emergency', protocol: 'Full Mobilization' }
              }
            }
          }
        },
        '3': { // 6 <= magnitude < 8
          feature: 'infrastructureDamage',
          thresholds: [0.6],
          children: {
            '0': { label: 4, description: 'Severe Emergency', protocol: 'Full Mobilization' },
            '1': { label: 5, description: 'Catastrophic Emergency', protocol: 'Maximum Response + Federal Aid' }
          }
        },
        '4': { // magnitude >= 8
          feature: 'populationAffected',
          thresholds: [10000],
          children: {
            '0': { label: 4, description: 'Severe Emergency', protocol: 'Full Mobilization' },
            '1': { label: 5, description: 'Catastrophic Emergency', protocol: 'Maximum Response + Federal Aid' }
          }
        }
      }
    };
  }

  _traverse(node, features) {
    if (node.label !== undefined) return node;
    const val = features[node.feature] || 0;
    let idx = node.thresholds.length;
    for (let i = 0; i < node.thresholds.length; i++) {
      if (val < node.thresholds[i]) { idx = i; break; }
    }
    return this._traverse(node.children[idx.toString()], features);
  }

  classify(incident) {
    const features = {
      magnitude:           incident.magnitude           || 0,
      populationAffected:  incident.populationAffected  || 0,
      infrastructureDamage: incident.infrastructureDamage || 0,
      weatherCondition:    incident.weatherCondition    || 0,
      responseTime:        incident.responseTime        || 0
    };

    const result = this._traverse(this.tree, features);
    const severityLabels = ['', 'MINIMAL', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
    const severityColors = ['', '#40c4ff', '#00e676', '#ffd600', '#ff6d00', '#ff1744'];

    const classification = {
      severity: result.label,
      severityLabel: severityLabels[result.label],
      color: severityColors[result.label],
      description: result.description,
      protocol: result.protocol,
      features,
      timestamp: Date.now(),
      resources: this._getResourceRecommendations(result.label, features),
      evacuationRequired: result.label >= 4,
      federalAidRequired: result.label >= 5
    };

    this.classificationHistory.push({ incidentId: incident.id, ...classification });
    if (this.classificationHistory.length > 200) this.classificationHistory.shift();
    return classification;
  }

  _getResourceRecommendations(severity, features) {
    const base = severity;
    return {
      ambulances:    Math.ceil(base * 1.5 + features.populationAffected / 5000),
      fireEngines:   Math.ceil(base * 1.2),
      rescueTeams:   Math.ceil(base * 2),
      medicalUnits:  Math.ceil(base * 1.0 + features.populationAffected / 10000),
      helicopters:   severity >= 4 ? Math.ceil(base * 0.5) : 0,
      totalPersonnel: severity * 25 + Math.ceil(features.populationAffected / 1000)
    };
  }

  getSeverityDistribution() {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    this.classificationHistory.forEach(c => { if (dist[c.severity] !== undefined) dist[c.severity]++; });
    return dist;
  }

  getAverageSeverity() {
    if (this.classificationHistory.length === 0) return 0;
    const sum = this.classificationHistory.reduce((s, c) => s + c.severity, 0);
    return (sum / this.classificationHistory.length).toFixed(2);
  }
};
