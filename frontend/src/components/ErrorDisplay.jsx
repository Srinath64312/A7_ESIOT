import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ErrorDisplay({ message, onRetry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: 'var(--danger)', textAlign: 'center' }}>
      <AlertTriangle size={48} style={{ marginBottom: '1rem' }} />
      <h3 style={{ marginBottom: '0.5rem' }}>Error</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{message}</p>
      {onRetry && (
        <button className="btn btn-outline" onClick={onRetry}>Try Again</button>
      )}
    </div>
  );
}
