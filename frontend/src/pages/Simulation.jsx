import React, { useState, useEffect } from 'react';
import { Play, Square, Activity } from 'lucide-react';
import { simulationService } from '../services/simulationService';
import { useMotorData } from '../hooks/useMotorData';
import { useWebSocket } from '../hooks/useWebSocket';
import TelemetryCard from '../components/TelemetryCard';
import PredictionPanel from '../components/PredictionPanel';
import AlertBadge from '../components/AlertBadge';

const SCENARIOS = [
  { id: 'NORMAL', label: 'Normal Operation', desc: 'Healthy motor behavior' },
  { id: 'OVERLOAD', label: 'Overload', desc: 'High current and temperature' },
  { id: 'OVERHEATING', label: 'Overheating', desc: 'Temperature rising steadily' },
  { id: 'HIGH_VIBRATION', label: 'High Vibration', desc: 'Bearing wear simulation' },
  { id: 'LOW_RPM', label: 'Low RPM', desc: 'Mechanical resistance' },
  { id: 'CRITICAL', label: 'Critical Failure', desc: 'Multiple fault indicators' }
];

export default function Simulation() {
  const { motors } = useMotorData();
  const { telemetry, predictions, mode } = useWebSocket();
  const [status, setStatus] = useState({ running: false, scenario: 'NORMAL', motor_id: null, tick_count: 0 });
  const [selectedMotorId, setSelectedMotorId] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('NORMAL');
  const [intervalMs, setIntervalMs] = useState(1000);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await simulationService.getStatus();
      setStatus(res);
      if (res.motor_id) setSelectedMotorId(res.motor_id);
      if (res.scenario) setSelectedScenario(res.scenario);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
    if (motors.length > 0 && !selectedMotorId) {
      setSelectedMotorId(motors[0].id);
    }
  }, [motors]);

  const handleStart = async () => {
    if (!selectedMotorId) return alert('Select a motor');
    setLoading(true);
    try {
      await simulationService.start(selectedScenario, selectedMotorId, intervalMs);
      await fetchStatus();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await simulationService.stop();
      await fetchStatus();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeTelemetry = telemetry[selectedMotorId];
  const activePrediction = predictions[selectedMotorId];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card" style={{ borderLeft: '4px solid var(--warning)', backgroundColor: 'rgba(245, 158, 11, 0.05)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', marginBottom: '0.5rem' }}>
          <Activity size={24} /> Simulation Control
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>Generate synthetic telemetry data to test the AI model and dashboard responsiveness.</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Configuration</h3>
          
          <div className="form-group">
            <label className="form-label">Target Motor</label>
            <select className="form-control" value={selectedMotorId} onChange={e => setSelectedMotorId(e.target.value)} disabled={status.running}>
              {motors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Interval (ms)</label>
            <input type="number" className="form-control" value={intervalMs} onChange={e => setIntervalMs(parseInt(e.target.value) || 1000)} disabled={status.running} min="100" />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Fault Scenario</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {SCENARIOS.map(s => (
                <div 
                  key={s.id}
                  onClick={() => !status.running && setSelectedScenario(s.id)}
                  style={{ 
                    padding: '1rem', 
                    border: `1px solid ${selectedScenario === s.id ? 'var(--primary)' : 'var(--border-color)'}`,
                    borderRadius: '0.5rem',
                    cursor: status.running ? 'not-allowed' : 'pointer',
                    backgroundColor: selectedScenario === s.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                    opacity: status.running && selectedScenario !== s.id ? 0.5 : 1
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{s.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {!status.running ? (
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleStart} disabled={loading}>
                <Play size={20} /> Start Simulation
              </button>
            ) : (
              <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={handleStop} disabled={loading}>
                <Square size={20} /> Stop Simulation
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Live Telemetry View</h3>
              <AlertBadge severity={status.running ? 'INFO' : 'NORMAL'} />
            </div>
            {status.running ? (
              <div className="grid-2">
                <TelemetryCard icon={Activity} label="Current" value={activeTelemetry?.current} unit="A" />
                <TelemetryCard icon={Activity} label="Temperature" value={activeTelemetry?.temperature} unit="°C" />
                <TelemetryCard icon={Activity} label="Vibration" value={activeTelemetry?.vibration} unit="mm/s" />
                <TelemetryCard icon={Activity} label="RPM" value={activeTelemetry?.rpm} unit="RPM" />
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Simulation stopped.</div>
            )}
          </div>
          
          {status.running && <PredictionPanel prediction={activePrediction} />}
        </div>
      </div>
    </div>
  );
}
