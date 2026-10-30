import { useState, useEffect, useCallback } from 'react';
import { motorService } from '../services/motorService';
import { DEMO_MOTORS } from '../services/demoMode';

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
      setMotors(list.length > 0 ? list : DEMO_MOTORS);
      if (motorId) {
        const motor = await motorService.getById(motorId);
        setSelectedMotor(motor);
      }
      setError(null);
    } catch (err) {
      console.warn('Backend not reachable — using demo motor data');
      setMotors(DEMO_MOTORS);
      if (motorId) setSelectedMotor(DEMO_MOTORS.find(m => m.id === parseInt(motorId)) || DEMO_MOTORS[0]);
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
