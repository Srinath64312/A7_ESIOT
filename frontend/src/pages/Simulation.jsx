import React, { useState, useEffect } from 'react';
import { Play, Square, Activity, PlusCircle, RotateCcw, Flame, Waves, Cpu } from 'lucide-react';
import { simulationService } from '../services/simulationService';
import { wsManager } from '../services/websocket';
import { DEMO_MOTORS } from '../services/demoMode';
import { useMotorData } from '../hooks/useMotorData';
import { useWebSocket } from '../hooks/useWebSocket';
import TelemetryCard from '../components/TelemetryCard';
import PredictionPanel from '../components/PredictionPanel';
import AlertBadge from '../components/AlertBadge';
import DigitalTwin from '../components/DigitalTwin';

const SCENARIOS = [
  { id: 'NORMAL',         label: 'Normal Operation', desc: 'Healthy motor behavior' },
  { id: 'OVERLOAD',       label: 'Overload',          desc: 'High current and temperature' },
  { id: 'OVERHEATING',    label: 'Overheating',       desc: 'Temperature rising steadily' },
  { id: 'HIGH_VIBRATION', label: 'High Vibration',    desc: 'Bearing wear simulation' },
  { id: 'LOW_RPM',        label: 'Low RPM',           desc: 'Mechanical resistance' },
  { id: 'CRITICAL',       label: 'Critical Failure',  desc: 'Multiple fault indicators' }
];

export default function Simulation() {
  const { motors: backendMotors } = useMotorData();
  const { telemetry, predictions, mode, isDemoMode } = useWebSocket();

  const [status, setStatus] = useState({ running: false, scenario: 'NORMAL', motor_id: null, tick_count: 0, temp_offset: 0, vib_offset: 0 });
  const [selectedMotorId, setSelectedMotorId] = useState(1);
  const [selectedScenario, setSelectedScenario] = useState('NORMAL');
  const [intervalMs, setIntervalMs] = useState(1000);
  const [tempOffset, setTempOffset] = useState(0);
  const [vibOffset, setVibOffset] = useState(0);
  const [loading, setLoading] = useState(false);

  // Use demo motors if backend is offline
  const motors = (isDemoMode || backendMotors.length === 0) ? DEMO_MOTORS : backendMotors;

  const fetchStatus = async () => {
    if (isDemoMode) {
      setStatus(wsManager.getDemoStatus());
      return;
    }
    try {
      const res = await simulationService.getStatus();
      setStatus(res);
      if (res.motor_id) setSelectedMotorId(res.motor_id);
      if (res.scenario) setSelectedScenario(res.scenario);
      if (typeof res.temp_offset === 'number') setTempOffset(res.temp_offset);
      if (typeof res.vib_offset === 'number') setVibOffset(res.vib_offset);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
    if (motors.length > 0 && !selectedMotorId) {
      setSelectedMotorId(motors[0].id);
    }
  }, [motors, isDemoMode]);

  const handleStart = async () => {
    if (!selectedMotorId) return alert('Select a motor');
    setLoading(true);
    try {
      if (isDemoMode) {
        // Demo mode: drive telemetry locally via wsManager
        wsManager.startDemoSimulation(
          selectedScenario, selectedMotorId, intervalMs,
          parseFloat(tempOffset) || 0, parseFloat(vibOffset) || 0
        );
        setStatus({ running: true, scenario: selectedScenario, motor_id: selectedMotorId, tick_count: 0, temp_offset: parseFloat(tempOffset) || 0, vib_offset: parseFloat(vibOffset) || 0 });
      } else {
        await simulationService.start(
          selectedScenario, selectedMotorId, intervalMs,
          parseFloat(tempOffset) || 0, parseFloat(vibOffset) || 0
        );
        await fetchStatus();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      if (isDemoMode) {
        wsManager.stopDemoSimulation();
        setStatus(prev => ({ ...prev, running: false }));
      } else {
        await simulationService.stop();
        await fetchStatus();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetOffsets = () => {
    setTempOffset(0);
    setVibOffset(0);
  };

  const activeTelemetry  = telemetry[selectedMotorId];
  const activePrediction = predictions[selectedMotorId];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div className="card" style={{ borderLeft: '4px solid var(--warning)', backgroundColor: 'rgba(245, 158, 11, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', marginBottom: '0.5rem' }}>
              <Activity size={24} /> Digital Twin Simulation Studio
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Real-time physics synchronization between simulated motor telemetry and the AI Digital Twin visualizer.
              Inject fault scenarios or custom sensor offsets to stress-test predictive intelligence.
            </p>
          </div>
          {isDemoMode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.9rem', borderRadius: '999px', backgroundColor: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.35)', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', marginLeft: '1rem' }}>
              <Cpu size={14} /> DEMO MODE
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>

        {/* Left: Digital Twin + Telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <DigitalTwin telemetry={activeTelemetry} prediction={activePrediction} />
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Live Telemetry View</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {status.running && (status.temp_offset !== 0 || status.vib_offset !== 0) && (
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    Offsets: {status.temp_offset > 0 ? `+${status.temp_offset}` : status.temp_offset}°C, {status.vib_offset > 0 ? `+${status.vib_offset}` : status.vib_offset}mm/s
                  </span>
                )}
                <AlertBadge severity={status.running ? 'INFO' : 'NORMAL'} />
              </div>
            </div>
            {status.running ? (
              <div className="grid-2">
                <TelemetryCard icon={Activity} label="Current"     value={activeTelemetry?.current}     unit="A" />
                <TelemetryCard icon={Activity} label="Temperature" value={activeTelemetry?.temperature} unit="°C" />
                <TelemetryCard icon={Activity} label="Vibration"   value={activeTelemetry?.vibration}   unit="mm/s" />
                <TelemetryCard icon={Activity} label="RPM"         value={activeTelemetry?.rpm}         unit="RPM" />
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                {isDemoMode
                  ? '🤖 Demo Mode active — click "Start Simulation" below to watch the Digital Twin animate.'
                  : 'Simulation stopped. Click "Start Simulation" to activate the Digital Twin stream.'}
              </div>
            )}
          </div>

          {status.running && <PredictionPanel prediction={activePrediction} />}
        </div>

        {/* Right: Control panel */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Simulation Control</h3>

          <div className="form-group">
            <label className="form-label">Target Motor</label>
            <select className="form-control" value={selectedMotorId} onChange={e => setSelectedMotorId(parseInt(e.target.value))} disabled={status.running}>
              {motors.map(m => <option key={m.id} value={m.id}>{m.name} — {m.location}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Interval (ms)</label>
            <input type="number" className="form-control" value={intervalMs} onChange={e => setIntervalMs(parseInt(e.target.value) || 1000)} disabled={status.running} min="100" />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Scenario Selection</label>
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
                    backgroundColor: selectedScenario === s.id ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                    opacity: status.running && selectedScenario !== s.id ? 0.5 : 1,
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{s.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
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

          {/* Custom Sensor Offsets */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <PlusCircle size={18} /> Custom Sensor Offsets
              </h4>
              <button
                onClick={handleResetOffsets}
                disabled={status.running}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: status.running ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Inject custom temperature & vibration deviations to test anomaly thresholds in real time.
            </p>
            <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Flame size={12} color="#f97316" /> Temp Offset (°C)
                </label>
                <input type="number" className="form-control" placeholder="0" value={tempOffset} onChange={e => setTempOffset(e.target.value)} disabled={status.running} style={{ fontSize: '0.85rem' }} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Waves size={12} color="#06b6d4" /> Vib Offset (mm/s)
                </label>
                <input type="number" className="form-control" placeholder="0" value={vibOffset} onChange={e => setVibOffset(e.target.value)} disabled={status.running} style={{ fontSize: '0.85rem' }} />
              </div>
            </div>

            {/* Quick presets */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button type="button" disabled={status.running} onClick={() => { setTempOffset(35); setVibOffset(0); }}
                style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(249, 115, 22, 0.1)', color: '#f97316', border: '1px solid rgba(249, 115, 22, 0.3)', cursor: status.running ? 'not-allowed' : 'pointer' }}>
                +35°C Hot Run
              </button>
              <button type="button" disabled={status.running} onClick={() => { setTempOffset(0); setVibOffset(8.5); }}
                style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.3)', cursor: status.running ? 'not-allowed' : 'pointer' }}>
                +8.5 mm/s Bearing Shock
              </button>
              <button type="button" disabled={status.running} onClick={() => { setTempOffset(45); setVibOffset(12.0); }}
                style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', cursor: status.running ? 'not-allowed' : 'pointer' }}>
                Critical Dual Spike
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
