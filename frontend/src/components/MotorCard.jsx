import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import AlertBadge from './AlertBadge';

export default function MotorCard({ motor }) {
  const navigate = useNavigate();
  
  return (
    <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }} onClick={() => navigate(`/motors/${motor.id}`)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{motor.name}</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{motor.location}</p>
        </div>
        <AlertBadge severity={motor.status} />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Health Score</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={16} className={motor.health_score > 75 ? 'text-success' : motor.health_score > 50 ? 'text-warning' : 'text-danger'} />
            <span style={{ fontWeight: 'bold' }}>{motor.health_score ? Math.round(motor.health_score) : '--'} / 100</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Last Updated</div>
          <div style={{ fontSize: '0.875rem' }}>
            {motor.last_reading_time ? new Date(motor.last_reading_time).toLocaleTimeString() : 'Never'}
          </div>
        </div>
      </div>
    </div>
  );
}
