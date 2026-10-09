import pandas as pd
import numpy as np
import os
import json
import joblib
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split

def train_models(data_path="dataset/motor_telemetry.csv", models_dir="ai/models/"):
    os.makedirs(models_dir, exist_ok=True)
    
    print("Loading dataset...")
    df = pd.read_csv(data_path)
    
    print("Feature engineering...")
    df['current_rpm_ratio'] = df['current'] / (df['rpm'] + 1)
    df['temperature_change'] = df.groupby('motor_id')['temperature'].diff().fillna(0)
    df['vibration_change'] = df.groupby('motor_id')['vibration'].diff().fillna(0)
    df['rpm_deviation'] = np.abs(df['rpm'] - 1500) / 1500
    
    features = ['rpm', 'current', 'temperature', 'vibration', 'voltage', 'load', 'pwm_duty', 
                'current_rpm_ratio', 'temperature_change', 'vibration_change', 'rpm_deviation']
    
    X = df[features]
    y_raw = df['condition']
    
    print("Preprocessing...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    le = LabelEncoder()
    y = le.fit_transform(y_raw)
    
    joblib.dump(scaler, os.path.join(models_dir, 'scaler.joblib'))
    joblib.dump(le, os.path.join(models_dir, 'label_encoder.joblib'))
    
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    
    print("Training Isolation Forest...")
    iso_forest = IsolationForest(contamination=0.15, random_state=42)
    iso_forest.fit(X_scaled)
    joblib.dump(iso_forest, os.path.join(models_dir, 'isolation_forest.joblib'))
    
    print("Training Random Forest...")
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    joblib.dump(rf, os.path.join(models_dir, 'random_forest.joblib'))
    
    print("Extracting Feature Importance...")
    importances = rf.feature_importances_
    feature_importance = {features[i]: float(importances[i]) for i in range(len(features))}
    with open(os.path.join(models_dir, 'feature_importance.json'), 'w') as f:
        json.dump(feature_importance, f, indent=4)
        
    print("Saving metadata...")
    metadata = {
        "features": features,
        "classes": le.classes_.tolist(),
        "n_samples": len(df)
    }
    with open(os.path.join(models_dir, 'model_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=4)
        
    print("Training complete.")

if __name__ == "__main__":
    train_models()
