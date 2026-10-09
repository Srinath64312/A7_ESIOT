import React, { useState, useEffect } from 'react';
import { Cpu, Wifi, AlertTriangle, XCircle, Zap, Thermometer, Activity, Battery, Hash } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useMotorData } from '../hooks/useMotorData';
import { readingService } from '../services/readingService';
import HealthGauge from '../components/HealthGauge';
import TelemetryCard from '../components/TelemetryCard';
import TelemetryChart from '../components/TelemetryChart';
import PredictionPanel from '../components/PredictionPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import EmptyState from '../components/EmptyState';

export default function Dashboard() {
  const { motors, loading, error } = useMotorData();
  const { telemetry, predictions } = useWebSocket();
  const [selectedMotorId, setSelectedMotorId] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    if (motors.length > 0 && !selectedMotorId) {
      setSelectedMotorId(motors[0].id);
    }
  }, [motors, selectedMotorId]);

  useEffect(() => {
    if (selectedMotorId) {
      readingService.getReadings(selectedMotorId, 50)
        .then(setHistoricalData)
        .catch(console.error);
    }
  }, [selectedMotorId]);

  useEffect(() => {
    if (selectedMotorId && telemetry[selectedMotorId]) {
      setHistoricalData(prev => {
        const newData = [...prev, telemetry[selectedMotorId]];
        if (newData.length > 50) newData.shift();
        return newData;
      });
    }
  }, [telemetry, selectedMotorId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;
  if (motors.length === 0) return <EmptyState title="No Motors Found" message="Add a motor to start monitoring." />;

  const onlineMotors = motors.filter(m => m.status !== 'OFFLINE').length;
  const warningMotors = motors.filter(m => m.status === 'WARNING').length;
  const criticalMotors = motors.filter(m => m.status === 'CRITICAL').length;
  const activeTelemetry = selectedMotorId ? telemetry[selectedMotorId] : null;
  const activePrediction = selectedMotorId ? predictions[selectedMotorId] : null;
  const selectedMotor = motors.find(m => m.id === selectedMotorId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="grid-4">
        <div className="card stat-card"><div className="stat-icon" style={{ backgroundColor: 'rgba(59,130,246,0.1)' }}><Cpu className="text-primary" /></div><div className="stat-content"><h3>Total Motors</h3><p>{motors.length}</p></div></div>
        <div className="card stat-card"><div className="stat-icon" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}><Wifi className="text-success" /></div><div className="stat-content"><h3>Online</h3><p>{onlineMotors}</p></div></div>
        <div className="card stat-card"><div className="stat-icon" style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}><AlertTriangle className="text-warning" /></div><div className="stat-content"><h3>Warnings</h3><p>{warningMotors}</p></div></div>
        <div className="card stat-card"><div className="stat-icon" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}><XCircle className="text-danger" /></div><div className="stat-content"><h3>Critical</h3><p>{criticalMotors}</p></div></div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Real-time Monitoring</h2>
        <select 
          className="form-control" 
          style={{ width: '250px' }}
          value={selectedMotorId || ''}
          onChange={(e) => setSelectedMotorId(parseInt(e.target.value))}
        >
          {motors.map(m => (
            <option key={m.id} value={m.id}>{m.name} ({m.location})</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
          <HealthGauge score={activePrediction ? (100 - activePrediction.anomaly_probability * 100) : selectedMotor?.health_score || 100} />
        </div>
        
        <div className="grid-3">
          <TelemetryCard icon={Zap} label="Current" value={activeTelemetry?.current} unit="A" status={activeTelemetry?.current > 15 ? 'warning' : 'normal'} />
          <TelemetryCard icon={Thermometer} label="Temperature" value={activeTelemetry?.temperature} unit="°C" status={activeTelemetry?.temperature > 70 ? 'critical' : 'normal'} />
          <TelemetryCard icon={Activity} label="Vibration" value={activeTelemetry?.vibration} unit="mm/s" status={activeTelemetry?.vibration > 5 ? 'warning' : 'normal'} />
          <TelemetryCard icon={Hash} label="RPM" value={activeTelemetry?.rpm} unit="RPM" />
          <TelemetryCard icon={Battery} label="Voltage" value={activeTelemetry?.voltage} unit="V" />
          <TelemetryCard icon={Cpu} label="Load" value={activeTelemetry ? (activeTelemetry.current / 20 * 100) : 0} unit="%" />
        </div>
      </div>

      <PredictionPanel prediction={activePrediction} />

      <div className="grid-2">
        <TelemetryChart data={historicalData} dataKey="current" title="Current Over Time" color="var(--primary)" unit="A" />
        <TelemetryChart data={historicalData} dataKey="temperature" title="Temperature Over Time" color="var(--danger)" unit="°C" />
        <TelemetryChart data={historicalData} dataKey="vibration" title="Vibration Over Time" color="var(--warning)" unit="mm/s" />
        <TelemetryChart data={historicalData} dataKey="rpm" title="RPM Over Time" color="var(--info)" unit="RPM" />
      </div>
    </div>
  );
}
