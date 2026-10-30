import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { Globe, Cpu } from 'lucide-react';

export default function StatusBar() {
  const location = useLocation();
  const { isConnected, mode, isDemoMode } = useWebSocket();
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
        {isDemoMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.65rem', borderRadius: '999px', backgroundColor: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.35)', color: '#38bdf8', fontSize: '0.72rem', fontWeight: 700 }}>
            <Cpu size={12} /> DEMO MODE
          </div>
        )}
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
          <span>{isConnected ? 'WebSocket Connected' : isDemoMode ? 'Demo Mode' : 'WebSocket Offline'}</span>
        </div>
        <span>{time}</span>
      </div>
    </header>
  );
}
