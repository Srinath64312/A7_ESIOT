import { useState, useEffect, useCallback } from 'react';
import { motorService } from '../services/motorService';

export function useMotorData(motorId = null) {
  const [motors, setMotors] = useState([]);
  const [selectedMotor, setSelectedMotor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMotors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await motorService.getAll();
      const list = Array.isArray(data) ? data : (data?.items || []);
      setMotors(list.length > 0 ? list : [
        { id: 1, name: "MTR-001", model: "Induction AC 3-Phase", location: "Plant Floor A - Line 1", status: "online", health_score: 92 }
      ]);
      if (motorId) {
        const motor = await motorService.getById(motorId);
        setSelectedMotor(motor);
      }
      setError(null);
    } catch (err) {
      console.warn("Backend not reachable, using demo motor data:", err.message);
      setMotors([
        { id: 1, name: "MTR-001", model: "Induction AC 3-Phase", location: "Plant Floor A - Line 1", status: "online", health_score: 92 }
      ]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [motorId]);

  useEffect(() => {
    fetchMotors();
  }, [fetchMotors]);

  return { motors, selectedMotor, loading, error, refetch: fetchMotors };
}
