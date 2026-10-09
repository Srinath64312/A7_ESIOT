import React, { useEffect, useState } from 'react';
import { Brain, CheckCircle, AlertCircle } from 'lucide-react';
import { aiService } from '../services/aiService';
import { useMotorData } from '../hooks/useMotorData';
import FeatureImportance from '../components/FeatureImportance';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';

export default function AIAnalytics() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { motors } = useMotorData();
  const [selectedMotorId, setSelectedMotorId] = useState(null);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    aiService.getStatus()
      .then(res => {
        setStatus(res);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (motors.length > 0 && !selectedMotorId) {
      setSelectedMotorId(motors[0].id);
    }
  }, [motors, selectedMotorId]);

  useEffect(() => {
    if (selectedMotorId) {
      aiService.getPrediction(selectedMotorId)
        .then(setPrediction)
        .catch(console.error);
    }
  }, [selectedMotorId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Brain size={48} className="text-primary" />
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>AI Model Status</h2>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <span>Version: {status?.model_version || '1.0.0'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Status: {status?.status === 'ready' ? <span className="text-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={14}/> Ready</span> : <span className="text-warning"><AlertCircle size={14}/> Offline</span>}
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>Model Interpretability</h3>
          <select 
            className="form-control" 
            style={{ width: '250px' }}
            value={selectedMotorId || ''}
            onChange={(e) => setSelectedMotorId(parseInt(e.target.value))}
          >
            {motors.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        
        {prediction && prediction.feature_importance ? (
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Which parameters contributed most to the current prediction for this motor:</p>
            <FeatureImportance data={prediction.feature_importance} />
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>No prediction data available for this motor.</p>
        )}
      </div>
    </div>
  );
}
