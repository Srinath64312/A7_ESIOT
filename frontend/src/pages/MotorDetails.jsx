import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Thermometer, Activity, Hash, Battery, Cpu } from 'lucide-react';
import { useMotorData } from '../hooks/useMotorData';
import { useWebSocket } from '../hooks/useWebSocket';
import { readingService } from '../services/readingService';
import { aiService } from '../services/aiService';
import HealthGauge from '../components/HealthGauge';
import TelemetryCard from '../components/TelemetryCard';
import TelemetryChart from '../components/TelemetryChart';
import PredictionPanel from '../components/PredictionPanel';
import AlertBadge from '../components/AlertBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';

export default function MotorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedMotor: motor, loading, error } = useMotorData(id);
  const { telemetry, predictions } = useWebSocket();
  const [historicalData, setHistoricalData] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [aiAnalysis, setAiAnalysis] = useState(null);

  useEffect(() => {
    if (id) {
      readingService.getReadings(id, 100).then(setHistoricalData).catch(console.error);
      aiService.getPrediction(id).then(setAiAnalysis).catch(console.error);
    }
  }, [id]);

  useEffect(() => {
    if (id && telemetry[id]) {
      setHistoricalData(prev => {
        const newData = [...prev, telemetry[id]];
        if (newData.length > 100) newData.shift();
        return newData;
      });
    }
  }, [telemetry, id]);

  if (loading) return <LoadingSpinner />;
  if (error || !motor) return <ErrorDisplay message={error || "Motor not found"} />;

  const activeTelemetry = telemetry[id] || historicalData[historicalData.length - 1];
  const activePrediction = predictions[id] || aiAnalysis;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'charts', label: 'Detailed Charts' },
    { id: 'ai', label: 'AI Analysis' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-outline" onClick={() => navigate('/motors')}><ArrowLeft size={16}/> Back</button>
        <div>
          <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {motor.name} <AlertBadge severity={motor.status} />
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>{motor.model} • {motor.location}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              background: 'none', border: 'none', padding: '1rem', cursor: 'pointer',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              fontWeight: activeTab === tab.id ? 600 : 400
            }}
          >{tab.label}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1.5rem' }}>
            <div className="card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
              <HealthGauge score={activePrediction ? (100 - activePrediction.anomaly_probability * 100) : motor.health_score} />
            </div>
            
            <div className="grid-3">
              <TelemetryCard icon={Zap} label="Current" value={activeTelemetry?.current} unit="A" />
              <TelemetryCard icon={Thermometer} label="Temperature" value={activeTelemetry?.temperature} unit="°C" />
              <TelemetryCard icon={Activity} label="Vibration" value={activeTelemetry?.vibration} unit="mm/s" />
              <TelemetryCard icon={Hash} label="RPM" value={activeTelemetry?.rpm} unit="RPM" />
              <TelemetryCard icon={Battery} label="Voltage" value={activeTelemetry?.voltage} unit="V" />
              <TelemetryCard icon={Cpu} label="Load" value={activeTelemetry ? (activeTelemetry.current / 20 * 100) : 0} unit="%" />
            </div>
          </div>
          <PredictionPanel prediction={activePrediction} />
        </>
      )}

      {activeTab === 'charts' && (
        <div className="grid-2">
          <TelemetryChart data={historicalData} dataKey="current" title="Current Over Time" color="var(--primary)" unit="A" />
          <TelemetryChart data={historicalData} dataKey="temperature" title="Temperature Over Time" color="var(--danger)" unit="°C" />
          <TelemetryChart data={historicalData} dataKey="vibration" title="Vibration Over Time" color="var(--warning)" unit="mm/s" />
          <TelemetryChart data={historicalData} dataKey="rpm" title="RPM Over Time" color="var(--info)" unit="RPM" />
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="card">
           <h3 style={{ marginBottom: '1rem' }}>Latest AI Diagnostics</h3>
           <PredictionPanel prediction={activePrediction} />
           {activePrediction?.feature_importance && (
             <div style={{ marginTop: '2rem' }}>
               <h4>Feature Importance</h4>
               <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Parameters contributing to the current prediction</p>
               {/* Simplified presentation if FeatureImportance component not suitable here */}
               <ul style={{ listStyle: 'none', padding: 0 }}>
                 {activePrediction.feature_importance.map((f, i) => (
                   <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                     <span>{f.feature}</span>
                     <span>{(f.importance * 100).toFixed(1)}%</span>
                   </li>
                 ))}
               </ul>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
