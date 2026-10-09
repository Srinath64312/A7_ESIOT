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
            
    def compute_health_score(self, anomaly_score, condition, telemetry):
        # anomaly_score is from IsolationForest: -1 (anomaly) to 1 (normal)
        # map to 0-1 probability of anomaly
        anomaly_prob = 1 - (anomaly_score + 1) / 2
        
        score = 100 - (anomaly_prob * 30)
        
        if condition == 'NORMAL':
            pass
        elif condition in ['LOW_RPM', 'HIGH_VIBRATION']:
            score -= 20
        elif condition in ['OVERLOAD', 'OVERHEATING']:
            score -= 40
        elif condition == 'MOTOR_ANOMALY':
            score -= 50
        elif condition == 'CRITICAL':
            score -= 80
            
        return max(0, min(100, int(score)))

    def generate_recommendation(self, condition, severity, telemetry):
        if condition == 'NORMAL':
            return "Monitor normally."
        elif condition == 'OVERLOAD':
            return "Reduce load immediately. Check for physical blockages."
        elif condition == 'OVERHEATING':
            return "Cooling system check required. Stop operation if temperature > 90C."
        elif condition == 'HIGH_VIBRATION':
            return "Check bearings and mounting alignment."
        elif condition == 'LOW_RPM':
            return "Check power supply and phase balance."
        elif condition == 'CRITICAL':
            return "SHUTDOWN IMMEDIATELY. Complete maintenance required."
        return "Schedule inspection."
        
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
        
        health_score = self.compute_health_score(anomaly_score, condition, telemetry_dict)
        
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
