import os
import sys

# Add the project root to sys.path so we can import from ai package
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
if project_root not in sys.path:
    sys.path.append(project_root)

try:
    from ai.predict import MotorPredictor
except ImportError:
    MotorPredictor = None

class AIEngine:
    def __init__(self, models_dir=None):
        if models_dir is None:
            models_dir = os.path.join(os.path.dirname(__file__), "../../../ai/models/")
        self.models_dir = os.path.abspath(models_dir)
        if MotorPredictor:
            self.predictor = MotorPredictor(models_dir=self.models_dir)
        else:
            self.predictor = None

    def predict(self, telemetry):
        if not self.predictor:
            return {"error": "Predictor module not available"}
        return self.predictor.predict(telemetry)
