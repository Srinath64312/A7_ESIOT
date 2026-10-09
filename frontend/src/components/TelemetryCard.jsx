import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

export default function TelemetryCard({ icon: Icon, label, value, unit, status = 'normal', trend = 'stable' }) {
  const getStatusColor = () => {
    switch(status) {
      case 'warning': return 'var(--warning)';
      case 'critical': return 'var(--danger)';
      default: return 'var(--primary)';
    }
  };

  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
  
  return (
    <div className="card" style={{ borderLeft: `4px solid ${getStatusColor()}`, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
        <Icon size={18} style={{ color: getStatusColor() }} />
        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
        <div style={{ marginLeft: 'auto', opacity: 0.5 }}>
          <TrendIcon size={16} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          {typeof value === 'number' ? value.toFixed(1) : value || '--'}
        </span>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{unit}</span>
      </div>
    </div>
  );
}
