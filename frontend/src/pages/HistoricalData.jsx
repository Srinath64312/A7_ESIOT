import React, { useState, useEffect } from 'react';
import { useMotorData } from '../hooks/useMotorData';
import { readingService } from '../services/readingService';
import TelemetryChart from '../components/TelemetryChart';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HistoricalData() {
  const { motors } = useMotorData();
  const [selectedMotorId, setSelectedMotorId] = useState(null);
  const [limit, setLimit] = useState(100);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (motors.length > 0 && !selectedMotorId) {
      setSelectedMotorId(motors[0].id);
    }
  }, [motors, selectedMotorId]);

  useEffect(() => {
    if (selectedMotorId) {
      setLoading(true);
      readingService.getReadings(selectedMotorId, limit)
        .then(res => {
          setData(res);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [selectedMotorId, limit]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div>
          <label className="form-label">Select Motor</label>
          <select className="form-control" value={selectedMotorId || ''} onChange={e => setSelectedMotorId(parseInt(e.target.value))}>
            {motors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Data Points</label>
          <select className="form-control" value={limit} onChange={e => setLimit(parseInt(e.target.value))}>
            <option value={50}>Last 50</option>
            <option value={100}>Last 100</option>
            <option value={500}>Last 500</option>
          </select>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="grid-2">
            <TelemetryChart data={data} dataKey="current" title="Current" color="var(--primary)" unit="A" />
            <TelemetryChart data={data} dataKey="temperature" title="Temperature" color="var(--danger)" unit="°C" />
            <TelemetryChart data={data} dataKey="vibration" title="Vibration" color="var(--warning)" unit="mm/s" />
            <TelemetryChart data={data} dataKey="rpm" title="RPM" color="var(--info)" unit="RPM" />
          </div>
          
          <div className="card table-container">
            <h3>Raw Data</h3>
            <table style={{ marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>RPM</th>
                  <th>Current (A)</th>
                  <th>Temperature (°C)</th>
                  <th>Vibration (mm/s)</th>
                  <th>Voltage (V)</th>
                </tr>
              </thead>
              <tbody>
                {data.map(row => (
                  <tr key={row.id}>
                    <td>{new Date(row.timestamp).toLocaleString()}</td>
                    <td>{row.rpm?.toFixed(1)}</td>
                    <td>{row.current?.toFixed(2)}</td>
                    <td>{row.temperature?.toFixed(1)}</td>
                    <td>{row.vibration?.toFixed(2)}</td>
                    <td>{row.voltage?.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
