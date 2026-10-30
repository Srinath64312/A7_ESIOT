import numpy as np
from typing import Optional, Dict, Any

class HealthCalculator:
    """
    Computes a composite Health Score (0-100) combining:
    1. Unsupervised Anomaly Probability (from Isolation Forest decision score)
    2. Supervised Condition Severity & Classification Confidence (from Random Forest)
    3. Physics-based Telemetry Degradation Penalty (thermal, vibration, overcurrent envelopes)
    """

    def __init__(self):
        # Physics nominal & critical operating limits
        self.temp_nominal = 50.0
        self.temp_critical = 100.0
        self.vib_nominal = 1.2
        self.vib_critical = 15.0
        self.current_nominal = 4.0
        self.current_critical = 16.0

    def calculate(
        self,
        anomaly_score: float,
        condition: str,
        confidence: float = 0.95,
        telemetry: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Calculates health score using composite formula:
        Health Score = [(1 - Anomaly Probability) * Confidence * Physics Factor] * 100 - Condition Penalty
        """
        # Isolation Forest decision_function returns float (typical range -0.5 to 0.5)
        # Lower / negative is more anomalous; positive is normal.
        if anomaly_score is not None:
            # Map decision function to anomaly probability [0.0, 1.0]
            anomaly_prob = float(np.clip(1.0 - (anomaly_score + 0.5), 0.0, 1.0))
        else:
            anomaly_prob = 0.05

        conf = float(np.clip(confidence, 0.5, 1.0))

        # Base AI health ratio [0.0 to 1.0]
        base_ai_ratio = 1.0 - (anomaly_prob * 0.7)

        # Physics factor degradation calculation
        physics_factor = 1.0
        if telemetry:
            temp = float(telemetry.get('temperature', self.temp_nominal))
            vib = float(telemetry.get('vibration', self.vib_nominal))
            current = float(telemetry.get('current', self.current_nominal))

            # Temperature stress
            if temp > self.temp_nominal:
                temp_ratio = max(0.0, (temp - self.temp_nominal) / (self.temp_critical - self.temp_nominal))
                physics_factor -= min(0.35, temp_ratio * 0.35)

            # Vibration mechanical wear stress
            if vib > self.vib_nominal:
                vib_ratio = max(0.0, (vib - self.vib_nominal) / (self.vib_critical - self.vib_nominal))
                physics_factor -= min(0.40, vib_ratio * 0.40)

            # Overcurrent electrical stress
            if current > self.current_nominal:
                curr_ratio = max(0.0, (current - self.current_nominal) / (self.current_critical - self.current_nominal))
                physics_factor -= min(0.25, curr_ratio * 0.25)

        physics_factor = max(0.10, physics_factor)

        # Specific fault penalty
        condition_penalties = {
            'NORMAL': 0,
            'LOW_RPM': 15,
            'HIGH_VIBRATION': 25,
            'OVERLOAD': 35,
            'OVERHEATING': 40,
            'MOTOR_ANOMALY': 50,
            'CRITICAL': 75
        }
        penalty = condition_penalties.get(condition, 10)

        # Composite computation
        raw_score = (base_ai_ratio * conf * physics_factor * 100.0) - penalty
        health_score = int(np.clip(round(raw_score), 0, 100))

        if health_score >= 80:
            status = "HEALTHY"
            color = "#22c55e"
        elif health_score >= 50:
            status = "WARNING"
            color = "#eab308"
        else:
            status = "CRITICAL"
            color = "#ef4444"

        return {
            "health_score": health_score,
            "anomaly_probability": round(anomaly_prob, 4),
            "confidence": round(conf, 4),
            "physics_factor": round(physics_factor, 3),
            "status": status,
            "status_color": color
        }

health_calculator = HealthCalculator()
