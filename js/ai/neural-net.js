window.DP = window.DP || {};

/**
 * NeuralDamagePredictor
 * 2-layer feed-forward Neural Network algorithm for non-linear disaster casualty & damage prediction
 * Features: [magnitude, wind, population, infraDamage]
 * Activations: Sigmoid hidden layer -> Linear output layer
 */
window.DP.NeuralDamagePredictor = class {
  constructor() {
    // Pre-trained weight matrices for disaster damage inference
    // Input (4 features) -> Hidden (5 neurons) -> Output (2 targets: casualtyEst, monetaryLossMillion)
    this.W1 = [
      [ 0.85,  0.42,  0.15,  0.78],
      [-0.32,  0.91,  0.65,  0.22],
      [ 0.54, -0.18,  0.88,  0.95],
      [ 0.12,  0.76, -0.45,  0.60],
      [ 0.67,  0.55,  0.72, -0.10]
    ];
    this.B1 = [0.1, -0.05, 0.2, 0.05, -0.1];

    this.W2 = [
      [ 1.45,  0.82,  2.10,  0.65,  1.15],
      [ 3.20,  1.85,  4.50,  2.10,  2.80]
    ];
    this.B2 = [50, 2.5];

    this.lastPrediction = null;
  }

  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  predict(incident, weather) {
    if (!incident) return null;

    // Normalized input vector [0, 1]
    const magnitude   = window.DP.Helpers.clamp((incident.magnitude || 5) / 10, 0, 1);
    const wind        = window.DP.Helpers.clamp(weather?.windSpeed || 0.5, 0, 1);
    const population  = window.DP.Helpers.clamp((incident.populationAffected || 5000) / 100000, 0, 1);
    const infra       = window.DP.Helpers.clamp(incident.infrastructureDamage || 0.5, 0, 1);

    const X = [magnitude, wind, population, infra];

    // Layer 1: Hidden Layer (5 neurons with Sigmoid activation)
    const H = [];
    for (let i = 0; i < 5; i++) {
      let sum = this.B1[i];
      for (let j = 0; j < 4; j++) {
        sum += this.W1[i][j] * X[j];
      }
      H.push(this.sigmoid(sum));
    }

    // Layer 2: Output Layer (Linear prediction)
    const Y = [];
    for (let i = 0; i < 2; i++) {
      let sum = this.B2[i];
      for (let j = 0; j < 5; j++) {
        sum += this.W2[i][j] * H[j];
      }
      Y.push(sum);
    }

    // Scale outputs to realistic numbers
    const estCasualties = Math.round(Y[0] * (incident.populationAffected || 1000) * 0.015);
    const estLossM = parseFloat((Y[1] * (incident.magnitude || 5) * 4.2).toFixed(1));

    this.lastPrediction = {
      incidentId: incident.id,
      estimatedCasualties: estCasualties,
      monetaryLossM: estLossM,
      riskIndex: parseFloat((((estCasualties / 100) + (estLossM / 10)) / 2).toFixed(2)),
      timestamp: Date.now()
    };

    return this.lastPrediction;
  }
};
