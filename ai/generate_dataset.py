import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

def generate_dataset(num_samples=10000, output_path="dataset/motor_telemetry.csv"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Probabilities
    conditions = ['NORMAL', 'OVERLOAD', 'OVERHEATING', 'HIGH_VIBRATION', 'LOW_RPM', 'MOTOR_ANOMALY', 'CRITICAL']
    probs = [0.60, 0.10, 0.08, 0.08, 0.07, 0.05, 0.02]
    
    np.random.seed(42)
    labels = np.random.choice(conditions, size=num_samples, p=probs)
    
    data = []
    start_time = datetime.now() - timedelta(days=30)
    
    for i in range(num_samples):
        condition = labels[i]
        timestamp = start_time + timedelta(minutes=5*i)
        motor_id = f"MTR_{np.random.randint(1, 11):03d}"
        
        # Base normal values
        rpm = np.random.uniform(1400, 1600)
        current = np.random.uniform(3, 5)
        temp = np.random.uniform(40, 60)
        vibration = np.random.uniform(0.5, 2.0)
        voltage = np.random.uniform(220, 240)
        load = np.random.uniform(30, 60)
        pwm_duty = np.random.uniform(40, 60)
        
        if condition == 'OVERLOAD':
            rpm = np.random.uniform(1000, 1300)
            current = np.random.uniform(7, 12)
            temp = np.random.uniform(65, 85)
            vibration = np.random.uniform(3, 6)
            load = np.random.uniform(80, 100)
        elif condition == 'OVERHEATING':
            temp = np.random.uniform(80, 110)
            current = np.random.uniform(5, 7)
        elif condition == 'HIGH_VIBRATION':
            vibration = np.random.uniform(5, 15)
            rpm = rpm + np.random.uniform(-200, 200)
            current = current + np.random.uniform(-1, 2)
        elif condition == 'LOW_RPM':
            rpm = np.random.uniform(400, 900)
            pwm_duty = np.random.uniform(50, 70)
        elif condition == 'MOTOR_ANOMALY':
            vibration = np.random.uniform(4, 10)
            rpm = rpm + np.random.uniform(-150, 150)
            current = np.random.uniform(6, 15)
        elif condition == 'CRITICAL':
            rpm = np.random.uniform(200, 800)
            current = np.random.uniform(10, 20)
            temp = np.random.uniform(90, 130)
            vibration = np.random.uniform(8, 20)
            load = np.random.uniform(90, 100)
        
        # Add some noise
        rpm += np.random.normal(0, 5)
        current += np.random.normal(0, 0.2)
        temp += np.random.normal(0, 1)
        vibration += np.random.normal(0, 0.1)
        voltage += np.random.normal(0, 2)
        
        data.append({
            'timestamp': timestamp.isoformat(),
            'motor_id': motor_id,
            'rpm': max(0, rpm),
            'current': max(0, current),
            'temperature': max(0, temp),
            'vibration': max(0, vibration),
            'voltage': max(0, voltage),
            'load': max(0, load),
            'pwm_duty': max(0, pwm_duty),
            'condition': condition
        })
        
    df = pd.DataFrame(data)
    df.to_csv(output_path, index=False)
    print(f"Dataset generated at {output_path} with {len(df)} samples.")

if __name__ == "__main__":
    generate_dataset()
