import React from 'react';
import { Loader } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
      <Loader className="spinner" size={32} style={{ marginBottom: '1rem' }} />
      <p>{message}</p>
    </div>
  );
}
