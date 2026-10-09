import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { Globe } from 'lucide-react';

export default function StatusBar() {
  const location = useLocation();
  const { isConnected, mode } = useWebSocket();
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = (path) => {
    const routeTitles = {
      '/': 'Website Overview',
      '/dashboard': 'Dashboard',
      '/motors': 'Motors Fleet',
      '/analytics': 'AI Analytics',
      '/alerts': 'Alerts',
      '/history': 'Historical Data',
      '/simulation': 'Simulation Station',
      '/settings': 'Settings',
    };
    if (path.startsWith('/motors/')) return 'Motor Details';
    return routeTitles[path] || 'AI-MotorGuard';
  };

  const isSimulation = mode === 'SIMULATION';

  return (
    <header className="status-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1>{getPageTitle(location.pathname)}</h1>
        <div className={`mode-badge ${isSimulation ? 'simulation' : 'hardware'}`}>
          {isSimulation ? 'SIMULATION MODE' : 'HARDWARE MODE'}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'var(--text-secondary)' }}>
        <Link 
          to="/" 
          className="btn btn-outline" 
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px' }}
        >
          <Globe size={15} />
          <span>Product Website</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
          <span>{isConnected ? 'WebSocket Connected' : 'WebSocket Offline'}</span>
        </div>
        <span>{time}</span>
      </div>
    </header>
  );
}
