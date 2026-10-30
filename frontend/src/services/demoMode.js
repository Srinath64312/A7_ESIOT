/**
 * Demo Mode Engine
 * Generates realistic live-looking telemetry locally when backend is offline.
 * Used by GitHub Pages deployment so visitors see a fully functional demo.
 */

const SCENARIOS = {
  NORMAL: {
    rpm: [1480, 1520], current: [3.8, 4.4], temperature: [48, 54],
    vibration: [1.0, 1.5], voltage: [228, 232], load: [42, 50],
    health: 92, condition: 'NORMAL', severity: 'LOW',
    rec: 'Motor operating within nominal physical bounds. Monitor routinely.'
  },
  OVERLOAD: {
    rpm: [1050, 1150], current: [8.5, 11.0], temperature: [72, 88],
    vibration: [3.5, 5.0], voltage: [218, 224], load: [85, 100],
    health: 41, condition: 'OVERLOAD', severity: 'HIGH',
    rec: 'Reduce mechanical load immediately. Inspect shaft and coupling alignment.'
  },
  OVERHEATING: {
    rpm: [1380, 1420], current: [4.8, 5.4], temperature: [88, 108],
    vibration: [1.8, 2.5], voltage: [227, 231], load: [58, 65],
    health: 28, condition: 'OVERHEATING', severity: 'HIGH',
    rec: 'Thermal safety threshold breached. Inspect coolant and dissipation fans.'
  },
  HIGH_VIBRATION: {
    rpm: [1300, 1700], current: [5.5, 7.5], temperature: [62, 70],
    vibration: [7.5, 14.0], voltage: [227, 233], load: [48, 58],
    health: 34, condition: 'HIGH_VIBRATION', severity: 'HIGH',
    rec: 'Severe vibration detected. Inspect bearings and base mounting bolts.'
  },
  LOW_RPM: {
    rpm: [450, 780], current: [6.5, 8.5], temperature: [57, 65],
    vibration: [2.5, 4.0], voltage: [222, 228], load: [72, 80],
    health: 55, condition: 'LOW_RPM', severity: 'MEDIUM',
    rec: 'RPM below nominal rating. Verify electrical phase balance and supply.'
  },
  CRITICAL: {
    rpm: [50, 400], current: [12.0, 19.5], temperature: [92, 118],
    vibration: [11.0, 22.0], voltage: [192, 212], load: [95, 100],
    health: 4, condition: 'CRITICAL', severity: 'HIGH',
    rec: 'EMERGENCY SHUTDOWN RECOMMENDED: Multiple telemetry anomalies detected.'
  }
};

function rand(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function gauss(mean, sd) {
  // Box-Muller transform
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return parseFloat((mean + sd * z).toFixed(2));
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

  // Recalculate health score based on offsets
  let health = s.health;
  if (tempOffset > 20) health = Math.max(0, health - 25);
  if (tempOffset > 40) health = Math.max(0, health - 30);
  if (vibOffset > 5)   health = Math.max(0, health - 20);
  if (vibOffset > 10)  health = Math.max(0, health - 25);

  const severity = health < 30 ? 'HIGH' : health < 60 ? 'MEDIUM' : 'LOW';
  const anomaly  = parseFloat(Math.max(0.02, Math.min(0.98, (100 - health) / 110)).toFixed(3));

  return {
    telemetry: {
      motor_id: motorId,
      timestamp: new Date().toISOString(),
      rpm, current, temperature, vibration, voltage, load,
      pwm_duty: 80,
      source: 'demo'
    },
    prediction: {
      motor_id: motorId,
      health_score: health,
      anomaly_probability: anomaly,
      predicted_condition: s.condition,
      confidence: parseFloat((0.80 + Math.random() * 0.18).toFixed(3)),
      severity,
      recommendation: s.rec,
      feature_contributions: {
        vibration: 0.190, current_rpm_ratio: 0.229, current: 0.126,
        temperature: 0.105, rpm_deviation: 0.111, rpm: 0.085
      }
    }
  };
}

export const DEMO_MOTORS = [
  { id: 1, name: 'MTR-001', model: 'Induction AC 3-Phase', location: 'Plant A - Line 1', status: 'online', health_score: 92 },
  { id: 2, name: 'MTR-002', model: 'DC Servo Motor',        location: 'Plant B - Line 3', status: 'online', health_score: 76 },
];

export const DEMO_ALERTS = [
  { id: 1, motor_id: 1, motor_name: 'MTR-001', severity: 'WARNING', condition: 'HIGH_VIBRATION', message: 'Vibration exceeded 6.0 mm/s threshold.', timestamp: new Date(Date.now() - 3600000).toISOString(), acknowledged: false },
  { id: 2, motor_id: 2, motor_name: 'MTR-002', severity: 'INFO',    condition: 'NORMAL',         message: 'Motor returned to healthy operating range.', timestamp: new Date(Date.now() - 7200000).toISOString(), acknowledged: true },
  { id: 3, motor_id: 1, motor_name: 'MTR-001', severity: 'CRITICAL',condition: 'OVERHEATING',    message: 'Temperature spiked to 98°C during load test.', timestamp: new Date(Date.now() - 10800000).toISOString(), acknowledged: true },
];
