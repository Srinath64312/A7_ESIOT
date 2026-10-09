import React from 'react';

export default function HealthGauge({ score = 100, size = 200 }) {
  const normalizedScore = Math.max(0, Math.min(100, score));
  
  let color = 'var(--success)';
  let label = 'HEALTHY';
  
  if (normalizedScore < 25) { color = 'var(--danger)'; label = 'CRITICAL'; }
  else if (normalizedScore < 50) { color = '#f97316'; label = 'DEGRADED'; } // orange
  else if (normalizedScore < 75) { color = 'var(--warning)'; label = 'WARNING'; }
  else if (normalizedScore < 90) { color = '#84cc16'; label = 'GOOD'; } // lime
  
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border-color)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out, stroke 0.5s ease' }}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: size * 0.25, fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: 1 }}>
            {Math.round(normalizedScore)}
          </span>
          <span style={{ fontSize: size * 0.08, color: 'var(--text-secondary)' }}>/ 100</span>
        </div>
      </div>
      <div style={{ marginTop: '1rem', fontWeight: 'bold', color, letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  );
}
