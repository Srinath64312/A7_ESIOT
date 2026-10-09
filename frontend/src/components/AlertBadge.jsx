import React from 'react';

export default function AlertBadge({ severity }) {
  const type = severity?.toUpperCase() || 'INFO';
  let className = 'badge-info';
  
  if (type === 'WARNING' || type === 'MEDIUM') className = 'badge-warning';
  else if (type === 'CRITICAL' || type === 'HIGH') className = 'badge-danger';
  else if (type === 'NORMAL' || type === 'SUCCESS' || type === 'LOW') className = 'badge-success';

  return (
    <span className={`badge ${className}`}>
      {type}
    </span>
  );
}
