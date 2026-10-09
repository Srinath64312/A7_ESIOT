import React, { useState, useEffect } from 'react';
import { alertService } from '../services/alertService';
import { useWebSocket } from '../hooks/useWebSocket';
import AlertBadge from '../components/AlertBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import EmptyState from '../components/EmptyState';
import { Bell, CheckCircle } from 'lucide-react';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const { alerts: wsAlerts } = useWebSocket();

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await alertService.getAll(0, 100);
      setAlerts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    if (wsAlerts.length > 0) {
      setAlerts(prev => {
        const newAlerts = [...wsAlerts, ...prev];
        const unique = Array.from(new Map(newAlerts.map(item => [item.id, item])).values());
        return unique.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      });
    }
  }, [wsAlerts]);

  const handleResolve = async (id) => {
    try {
      await alertService.resolve(id, 'Resolved via dashboard');
      setAlerts(alerts.map(a => a.id === id ? { ...a, resolved: true, resolved_at: new Date().toISOString() } : a));
    } catch (err) {
      alert('Failed to resolve alert');
    }
  };

  if (loading && alerts.length === 0) return <LoadingSpinner />;
  if (error && alerts.length === 0) return <ErrorDisplay message={error} onRetry={fetchAlerts} />;

  const filteredAlerts = filter === 'ALL' ? alerts : alerts.filter(a => a.severity === filter);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>System Alerts</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'INFO', 'WARNING', 'CRITICAL'].map(f => (
            <button 
              key={f} 
              className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter(f)}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <EmptyState title="No Alerts" message="All systems operating normally." icon={Bell} />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Severity</th>
                <th>Type</th>
                <th>Motor ID</th>
                <th>Message</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map(alert => (
                <tr key={alert.id} style={{ opacity: alert.resolved ? 0.6 : 1 }}>
                  <td><AlertBadge severity={alert.severity} /></td>
                  <td>{alert.alert_type}</td>
                  <td>{alert.motor_id}</td>
                  <td>{alert.message}</td>
                  <td>{new Date(alert.created_at).toLocaleString()}</td>
                  <td>
                    {alert.resolved ? (
                      <span className="text-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={14}/> Resolved</span>
                    ) : (
                      <span className="text-warning">Active</span>
                    )}
                  </td>
                  <td>
                    {!alert.resolved && (
                      <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleResolve(alert.id)}>
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
