/**
 * Client-Side AI Simulation & Telemetry Engine
 * Runs completely in the browser on GitHub Pages or static hosts when
 * a dedicated cloud backend is not connected.
 */

export const SCENARIOS = {
  NORMAL: {
    rpm: [1480, 1520], current: [3.8, 4.4], temperature: [48, 54],
    vibration: [1.0, 1.5], voltage: [228, 232], load: [42, 50],
    health: 94, condition: 'NORMAL', severity: 'LOW',
    rec: 'Motor operating within nominal physical bounds. Routine baseline schedule.'
  },
  OVERLOAD: {
    rpm: [1050, 1150], current: [8.5, 11.0], temperature: [72, 88],
    vibration: [3.5, 5.0], voltage: [218, 224], load: [85, 100],
    health: 45, condition: 'OVERLOAD', severity: 'HIGH',
    rec: 'Reduce mechanical load immediately. Inspect shaft and coupling alignment.'
  },
  OVERHEATING: {
    rpm: [1380, 1420], current: [4.8, 5.4], temperature: [88, 108],
    vibration: [1.8, 2.5], voltage: [227, 231], load: [58, 65],
    health: 32, condition: 'OVERHEATING', severity: 'HIGH',
    rec: 'Thermal safety threshold breached. Inspect coolant and heat dissipation fans.'
  },
  HIGH_VIBRATION: {
    rpm: [1300, 1700], current: [5.5, 7.5], temperature: [62, 70],
    vibration: [7.5, 14.0], voltage: [227, 233], load: [48, 58],
    health: 38, condition: 'HIGH_VIBRATION', severity: 'HIGH',
    rec: 'Severe vibration detected. Inspect bearings and base mounting bolts.'
  },
  LOW_RPM: {
    rpm: [450, 780], current: [6.5, 8.5], temperature: [57, 65],
    vibration: [2.5, 4.0], voltage: [222, 228], load: [72, 80],
    health: 58, condition: 'LOW_RPM', severity: 'MEDIUM',
    rec: 'RPM below nominal rating. Verify electrical phase balance and motor supply.'
  },
  CRITICAL: {
    rpm: [50, 400], current: [12.0, 19.5], temperature: [92, 118],
    vibration: [11.0, 22.0], voltage: [192, 212], load: [95, 100],
    health: 6, condition: 'CRITICAL', severity: 'HIGH',
    rec: 'EMERGENCY SHUTDOWN RECOMMENDED: Multiple telemetry anomalies detected.'
  }
};

function rand(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

export function generateDemoTick(scenario = 'NORMAL', motorId = 1, tempOffset = 0, vibOffset = 0) {
  const s = SCENARIOS[scenario] || SCENARIOS.NORMAL;
  const r = (arr) => rand(arr[0], arr[1]);

  const temperature = Math.max(0, r(s.temperature) + parseFloat(tempOffset || 0));
  const vibration   = Math.max(0, r(s.vibration)   + parseFloat(vibOffset  || 0));
  const current     = Math.max(0, r(s.current));
  const rpm         = Math.max(0, r(s.rpm));
  const voltage     = r(s.voltage);
  const load        = r(s.load);

  // Recalculate composite health score with offsets
  let health = s.health;
  if (tempOffset > 15) health = Math.max(2, health - (tempOffset * 0.8));
  if (vibOffset > 3)   health = Math.max(2, health - (vibOffset * 2.5));

  const finalHealth = Math.max(0, Math.min(100, Math.round(health)));
  const severity = finalHealth < 40 ? 'HIGH' : finalHealth < 75 ? 'MEDIUM' : 'LOW';
  const anomaly  = parseFloat(Math.max(0.03, Math.min(0.98, (100 - finalHealth) / 105)).toFixed(3));

  return {
    telemetry: {
      motor_id: motorId,
      timestamp: new Date().toISOString(),
      rpm, current, temperature, vibration, voltage, load,
      pwm_duty: 80,
      source: 'simulation_engine'
    },
    prediction: {
      motor_id: motorId,
      health_score: finalHealth,
      anomaly_probability: anomaly,
      predicted_condition: finalHealth < 40 && s.condition === 'NORMAL' ? 'MOTOR_ANOMALY' : s.condition,
      confidence: parseFloat((0.85 + Math.random() * 0.12).toFixed(3)),
      severity,
      recommendation: s.rec,
      feature_contributions: {
        vibration: 0.21,
        current_rpm_ratio: 0.23,
        current: 0.14,
        temperature: 0.12,
        rpm_deviation: 0.11,
        rpm: 0.09
      }
    }
  };
}

export function generateHistoricalReadings(count = 50, motorId = 1) {
  const readings = [];
  const now = Date.now();
  for (let i = count; i >= 0; i--) {
    const time = new Date(now - i * 5000).toLocaleTimeString();
    readings.push({
      timestamp: time,
      motor_id: motorId,
      rpm: rand(1470, 1530),
      current: rand(3.9, 4.3),
      temperature: rand(49, 53),
      vibration: rand(1.1, 1.4),
      voltage: rand(229, 231),
      load: rand(44, 48)
    });
  }
  return readings;
}

export const DEMO_MOTORS = [
  { id: 1, name: 'MTR-001', model: 'Induction AC 3-Phase', location: 'Plant A - Line 1', status: 'online', health_score: 94 },
  { id: 2, name: 'MTR-002', model: 'DC Servo Motor',        location: 'Plant B - Line 3', status: 'online', health_score: 82 },
  { id: 3, name: 'MTR-003', model: 'High-Torque Synchronous', location: 'Plant A - Line 2', status: 'warning', health_score: 68 },
];

export const DEMO_ALERTS = [
  { id: 1, motor_id: 1, motor_name: 'MTR-001', severity: 'WARNING', condition: 'HIGH_VIBRATION', message: 'Vibration amplitude crossed 6.0 mm/s envelope threshold.', timestamp: new Date(Date.now() - 1800000).toISOString(), acknowledged: false },
  { id: 2, motor_id: 3, motor_name: 'MTR-003', severity: 'WARNING', condition: 'OVERLOAD', message: 'Current draw exceeded 9.5A rating for 45s.', timestamp: new Date(Date.now() - 5400000).toISOString(), acknowledged: false },
  { id: 3, motor_id: 1, motor_name: 'MTR-001', severity: 'INFO', condition: 'NORMAL', message: 'Thermal stabilization complete. Operating within baseline.', timestamp: new Date(Date.now() - 8200000).toISOString(), acknowledged: true },
];

export const DEMO_AI_STATUS = {
  model_version: '1.0.0-dual-rf-if',
  status: 'ready',
  models: {
    isolation_forest: 'Loaded & Calibrated',
    random_forest: 'Loaded (98.4% F1-Score)',
    scaler: 'StandardScaler Fitted'
  },
  feature_importance: [
    { feature: 'current_rpm_ratio', importance: 0.229 },
    { feature: 'vibration', importance: 0.190 },
    { feature: 'current', importance: 0.126 },
    { feature: 'rpm_deviation', importance: 0.111 },
    { feature: 'temperature', importance: 0.105 },
    { feature: 'rpm', importance: 0.085 }
  ]
};
