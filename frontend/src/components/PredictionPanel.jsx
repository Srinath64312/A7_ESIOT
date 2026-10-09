import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import AlertBadge from './AlertBadge';

export default function PredictionPanel({ prediction }) {
  if (!prediction) return null;

  const prob = prediction.anomaly_probability * 100;
  
  return (
    <div className="card" style={{ background: 'linear-gradient(145deg, var(--surface-color) 0%, #151e2e 100%)', border: '1px solid var(--border-color)' }}>
      <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <AlertCircle size={20} className="text-primary" />
        AI Diagnostic Analysis
      </h3>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Anomaly Probability</span>
          <span style={{ fontWeight: 'bold' }}>{prob.toFixed(1)}%</span>
        </div>
        <div style={{ height: '8px', backgroundColor: 'var(--bg-color)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${prob}%`, 
            backgroundColor: prob > 70 ? 'var(--danger)' : prob > 40 ? 'var(--warning)' : 'var(--success)',
            transition: 'width 0.5s ease-in-out'
          }} />
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Predicted Condition</div>
          <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{prediction.predicted_condition}</div>
        </div>
        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Severity Level</div>
          <AlertBadge severity={prediction.severity} />
        </div>
      </div>

      <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid var(--primary)', borderRadius: '0 0.5rem 0.5rem 0', display: 'flex', gap: '1rem' }}>
        <Info className="text-primary" size={24} style={{ flexShrink: 0 }} />
        <div>
          <h4 style={{ fontSize: '0.875rem', color: 'var(--primary)', marginBottom: '0.25rem', fontWeight: 600 }}>Recommendation</h4>
          <p style={{ fontSize: '0.875rem' }}>{prediction.recommendation}</p>
        </div>
      </div>
    </div>
  );
}
