import pandas as pd
import numpy as np
import os
import json
import joblib
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

def evaluate(data_path="dataset/motor_telemetry.csv", models_dir="ai/models/"):
    df = pd.read_csv(data_path)
    
    df['current_rpm_ratio'] = df['current'] / (df['rpm'] + 1)
    df['temperature_change'] = df.groupby('motor_id')['temperature'].diff().fillna(0)
    df['vibration_change'] = df.groupby('motor_id')['vibration'].diff().fillna(0)
    df['rpm_deviation'] = np.abs(df['rpm'] - 1500) / 1500
    
    scaler = joblib.load(os.path.join(models_dir, 'scaler.joblib'))
    le = joblib.load(os.path.join(models_dir, 'label_encoder.joblib'))
    rf = joblib.load(os.path.join(models_dir, 'random_forest.joblib'))
    
    with open(os.path.join(models_dir, 'model_metadata.json'), 'r') as f:
        metadata = json.load(f)
    
    features = metadata['features']
    X = df[features]
    y_true = df['condition']
    
    X_scaled = scaler.transform(X)
    y_pred_idx = rf.predict(X_scaled)
    y_pred = le.inverse_transform(y_pred_idx)
    
    report = classification_report(y_true, y_pred, output_dict=True)
    matrix = confusion_matrix(y_true, y_pred).tolist()
    
    results = {
        "accuracy": accuracy_score(y_true, y_pred),
        "classification_report": report,
        "confusion_matrix": matrix,
        "classes": le.classes_.tolist()
    }
    
    with open(os.path.join(models_dir, 'evaluation_report.json'), 'w') as f:
        json.dump(results, f, indent=4)
    print("Evaluation saved to", os.path.join(models_dir, 'evaluation_report.json'))

if __name__ == "__main__":
    evaluate()
