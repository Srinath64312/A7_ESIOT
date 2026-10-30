import React from 'react';
import { Activity, Thermometer, Gauge, Zap } from 'lucide-react';

const DigitalTwin = ({ telemetry, prediction }) => {
  if (!telemetry) {
    return (
      <div className="digital-twin-placeholder">
        <div className="placeholder-content">
          <Activity size={48} className="placeholder-icon" />
          <p>Waiting for telemetry data...</p>
        </div>
      </div>
    );
  }

  // Derived visuals
  const rpm = telemetry.rpm || 0;
  const temp = telemetry.temperature || 0;
  const vibration = telemetry.vibration || 0;
  const current = telemetry.current || 0;
  const health = prediction?.health_score || 100;

  // Color mapping for temperature: Blue (cold) -> Green (ok) -> Yellow (warm) -> Red (hot)
  const getTempColor = (t) => {
    if (t < 40) return '#3b82f6'; // Blue
    if (t < 70) return '#22c55e'; // Green
    if (t < 90) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  const tempColor = getTempColor(temp);
  const rotationDuration = rpm > 0 ? 60 / (rpm / 100) : 0; // Simplified rotation speed
  const vibrationAmplitude = Math.min(vibration * 0.5, 5); // Limit visual shake

  return (
    <div className="digital-twin-container">
      <style>{`
        .digital-twin-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle, #1a1a2e 0%, #0f0f1a 100%);
          border-radius: 1rem;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          min-height: 400px;
          border: 1px solid var(--border-color);
        }
        .motor-wrapper {
          position: relative;
          width: 200px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: ${vibrationAmplitude > 0 ? `shake ${0.1 + (1/vibration)}s infinite` : 'none'};
        }
        .motor-core {
          width: 120px;
          height: 120px;
          background: #4a5568;
          border-radius: 50%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px ${tempColor}66;
          border: 4px solid #2d3748;
          transition: box-shadow 0.5s ease;
        }
        .motor-rotor {
          width: 80px;
          height: 80px;
          border: 8px dashed #cbd5e0;
          border-radius: 50%;
          animation: ${rotationDuration > 0 ? `rotate ${rotationDuration}s linear infinite` : 'none'};
        }
        .health-ring {
          position: absolute;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          border: 8px solid transparent;
          border-top-color: ${health > 80 ? '#22c55e' : health > 50 ? '#eab308' : '#ef4444'};
          animation: rotate 2s linear infinite;
        }
        .telemetry-overlay {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          right: 1rem;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }
        .stat-pill {
          background: rgba(0,0,0,0.6);
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          color: white;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .digital-twin-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          background: #1a1a2e;
          border-radius: 1rem;
          color: #4a5568;
          border: 1px solid var(--border-color);
        }
        .placeholder-content {
          text-align: center;
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shake {
          0% { transform: translate(0, 0); }
          25% { transform: translate(${vibrationAmplitude}px, -${vibrationAmplitude}px); }
          50% { transform: translate(-${vibrationAmplitude}px, ${vibrationAmplitude}px); }
          75% { transform: translate(${vibrationAmplitude}px, ${vibrationAmplitude}px); }
          100% { transform: translate(0, 0); }
        }
      `}</style>

      <div className="motor-wrapper">
        <div className="health-ring"></div>
        <div className="motor-core">
          <div className="motor-rotor"></div>
        </div>
      </div>

      <div className="telemetry-overlay">
        <div className="stat-pill"><Gauge size={12} /> RPM: {rpm}</div>
        <div className="stat-pill"><Thermometer size={12} /> Temp: {temp}°C</div>
        <div className="stat-pill"><Activity size={12} /> Vib: {vibration}mm/s</div>
        <div className="stat-pill"><Zap size={12} /> Cur: {current}A</div>
      </div>

      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        color: 'white',
        fontSize: '0.875rem',
        fontWeight: 'bold',
        padding: '0.25rem 0.75rem',
        borderRadius: '0.5rem',
        backgroundColor: health > 80 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
        border: `1px solid ${health > 80 ? '#22c55e' : '#ef4444'}`
      }}>
        AI Health: {health}%
      </div>
    </div>
  );
};

export default DigitalTwin;
