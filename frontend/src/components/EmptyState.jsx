import React from 'react';
import { FileQuestion } from 'lucide-react';

export default function EmptyState({ title = 'No Data', message = 'There is no data to display.', icon: Icon = FileQuestion, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)', textAlign: 'center', backgroundColor: 'var(--surface-color)', borderRadius: '0.5rem', border: '1px dashed var(--border-color)' }}>
      <Icon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
      <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>{message}</p>
      {action && action}
    </div>
  );
}
