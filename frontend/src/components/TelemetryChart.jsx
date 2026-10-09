import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TelemetryChart({ data, dataKey, title, color = '#3b82f6', unit = '' }) {
  return (
    <div className="card" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 500 }}>{title}</h3>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={12} tickFormatter={(tick) => {
                if (!tick) return '';
                const date = new Date(tick);
                return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
              }} 
            />
            <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => val.toFixed(0)} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '0.25rem' }}
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#f1f5f9' }}
              formatter={(value) => [`${Number(value).toFixed(2)} ${unit}`, title]}
              labelFormatter={(label) => new Date(label).toLocaleTimeString()}
            />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
