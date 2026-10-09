class FeatureEngineer:
    def process(self, telemetry):
        features = dict(telemetry)
        features['current_rpm_ratio'] = features['current'] / (features['rpm'] + 1)
        features['temperature_change'] = features.get('temperature_change', 0.0)
        features['vibration_change'] = features.get('vibration_change', 0.0)
        features['rpm_deviation'] = abs(features['rpm'] - 1500) / 1500
        return features
