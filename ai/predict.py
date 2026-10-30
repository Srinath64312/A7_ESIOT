import os
import json
import joblib
import numpy as np
import pandas as pd

class MotorPredictor:
    def __init__(self, models_dir="ai/models/"):
        self.models_dir = models_dir
        self.iso_forest = None
        self.rf = None
        self.scaler = None
        self.le = None
        self.metadata = None
        self.feature_importance = None
        self.load_models()
        
    def load_models(self):
        try:
            self.iso_forest = joblib.load(os.path.join(self.models_dir, 'isolation_forest.joblib'))
            self.rf = joblib.load(os.path.join(self.models_dir, 'random_forest.joblib'))
            self.scaler = joblib.load(os.path.join(self.models_dir, 'scaler.joblib'))
            self.le = joblib.load(os.path.join(self.models_dir, 'label_encoder.joblib'))
            
            with open(os.path.join(self.models_dir, 'model_metadata.json'), 'r') as f:
                self.metadata = json.load(f)
            with open(os.path.join(self.models_dir, 'feature_importance.json'), 'r') as f:
                self.feature_importance = json.load(f)
        except Exception as e:
            print(f"Could not load models: {e}")
            
    def compute_health_score(self, anomaly_score, condition, telemetry, confidence=1.0):
        """
        Data-driven Composite Health Score:
        Health Score = (1 - Anomaly Probability) * Confidence * Physics Degradation Factor - Condition Penalty
        """
        # decision_function from Isolation Forest: positive = normal, negative = anomaly
        anomaly_prob = float(np.clip(1.0 - (anomaly_score + 0.5), 0.0, 1.0))
        conf_factor = float(np.clip(confidence, 0.5, 1.0))
        
        # Physics factor degradation calculation based on operating boundaries
        physics_factor = 1.0
        if telemetry:
            temp = float(telemetry.get('temperature', 50.0))
            vib = float(telemetry.get('vibration', 1.2))
            current = float(telemetry.get('current', 4.0))

            if temp > 50.0:
                physics_factor -= min(0.35, max(0.0, (temp - 50.0) / 55.0) * 0.35)
            if vib > 1.2:
                physics_factor -= min(0.40, max(0.0, (vib - 1.2) / 13.8) * 0.40)
            if current > 4.0:
                physics_factor -= min(0.25, max(0.0, (current - 4.0) / 14.0) * 0.25)

        physics_factor = max(0.1, physics_factor)
        base_ai_ratio = 1.0 - (anomaly_prob * 0.70)
        
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
        
        raw_score = (base_ai_ratio * conf_factor * physics_factor * 100.0) - penalty
        return max(0, min(100, int(round(raw_score))))

    def generate_recommendation(self, condition, severity, telemetry):
        if condition == 'NORMAL':
            return "Motor operating within nominal physical bounds. Monitor routinely."
        elif condition == 'OVERLOAD':
            return "Reduce mechanical load immediately. Inspect shaft and coupling alignment."
        elif condition == 'OVERHEATING':
            return "Thermal safety threshold breached. Inspect coolant and heat dissipation fans."
        elif condition == 'HIGH_VIBRATION':
            return "Severe vibration detected. Inspect bearings and base mounting bolts."
        elif condition == 'LOW_RPM':
            return "RPM below nominal rating. Verify electrical phase balance and motor supply."
        elif condition == 'CRITICAL':
            return "EMERGENCY SHUTDOWN RECOMMENDED: Multiple telemetry anomalies detected."
        return "Schedule preventive inspection."
        
    def predict(self, telemetry_dict):
        if not self.rf:
            return {"error": "Models not loaded"}
            
        df = pd.DataFrame([telemetry_dict])
        
        df['current_rpm_ratio'] = df['current'] / (df['rpm'] + 1)
        df['temperature_change'] = telemetry_dict.get('temperature_change', 0)
        df['vibration_change'] = telemetry_dict.get('vibration_change', 0)
        df['rpm_deviation'] = np.abs(df['rpm'] - 1500) / 1500
        
        X = df[self.metadata['features']]
        X_scaled = self.scaler.transform(X)
        
        anomaly_score = self.iso_forest.decision_function(X_scaled)[0] # -1 to 1
        anomaly_probability = float(1 - (anomaly_score + 1) / 2)
        
        pred_idx = self.rf.predict(X_scaled)[0]
        condition = self.le.inverse_transform([pred_idx])[0]
        
        prob = self.rf.predict_proba(X_scaled)[0]
        confidence = float(np.max(prob))
        
        health_score = self.compute_health_score(anomaly_score, condition, telemetry_dict, confidence=confidence)
        
        severity = "HIGH" if health_score < 50 else "LOW" if health_score > 80 else "MEDIUM"
        
        return {
            "health_score": health_score,
            "anomaly_probability": anomaly_probability,
            "predicted_condition": condition,
            "confidence": confidence,
            "severity": severity,
            "recommendation": self.generate_recommendation(condition, severity, telemetry_dict),
            "feature_contributions": self.feature_importance
        }
