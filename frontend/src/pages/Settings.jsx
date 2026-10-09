import React, { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('motorguard_settings');
    return saved ? JSON.parse(saved) : {
      targetRpm: 1500,
      samplingInterval: 1000,
      tempWarning: 60,
      tempCritical: 80,
      currentWarning: 20,
      currentCritical: 25,
      vibWarning: 4.5,
      vibCritical: 7.0
    };
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSave = () => {
    localStorage.setItem('motorguard_settings', JSON.stringify(settings));
    alert('Settings saved successfully');
  };

  const handleReset = () => {
    setSettings({
      targetRpm: 1500,
      samplingInterval: 1000,
      tempWarning: 60,
      tempCritical: 80,
      currentWarning: 20,
      currentCritical: 25,
      vibWarning: 4.5,
      vibCritical: 7.0
    });
  };

  return (
    <div className="card" style={{ maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '2rem' }}>System Settings</h2>

      <div style={{ display: 'grid', gap: '2rem' }}>
        <section>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>General Parameters</h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Target RPM</label>
              <input type="number" name="targetRpm" className="form-control" value={settings.targetRpm} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Sampling Interval (ms)</label>
              <input type="number" name="samplingInterval" className="form-control" value={settings.samplingInterval} onChange={handleChange} step="100" min="100" />
            </div>
          </div>
        </section>

        <section>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Thresholds: Temperature (°C)</h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label text-warning">Warning Threshold</label>
              <input type="number" name="tempWarning" className="form-control" value={settings.tempWarning} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label text-danger">Critical Threshold</label>
              <input type="number" name="tempCritical" className="form-control" value={settings.tempCritical} onChange={handleChange} />
            </div>
          </div>
        </section>

        <section>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Thresholds: Current (A)</h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label text-warning">Warning Threshold</label>
              <input type="number" name="currentWarning" className="form-control" value={settings.currentWarning} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label text-danger">Critical Threshold</label>
              <input type="number" name="currentCritical" className="form-control" value={settings.currentCritical} onChange={handleChange} />
            </div>
          </div>
        </section>
        
        <section>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Thresholds: Vibration (mm/s)</h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label text-warning">Warning Threshold</label>
              <input type="number" name="vibWarning" className="form-control" value={settings.vibWarning} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label text-danger">Critical Threshold</label>
              <input type="number" name="vibCritical" className="form-control" value={settings.vibCritical} onChange={handleChange} step="0.1" />
            </div>
          </div>
        </section>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <button className="btn btn-primary" onClick={handleSave}><Save size={18}/> Save Settings</button>
        <button className="btn btn-outline" onClick={handleReset}><RotateCcw size={18}/> Reset Defaults</button>
      </div>
    </div>
  );
}
