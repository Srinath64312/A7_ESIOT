import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function FeatureImportance({ data }) {
  if (!data || data.length === 0) return <div>No feature importance data available.</div>;

  const chartData = data.map(item => ({
    name: item.feature,
    importance: item.importance * 100
  })).sort((a, b) => b.importance - a.importance);

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
          <XAxis type="number" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val}%`} />
          <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={100} />
          <Tooltip 
            formatter={(value) => [`${value.toFixed(1)}%`, 'Importance']}
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '0.25rem' }}
            itemStyle={{ color: '#f1f5f9' }}
          />
          <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--primary)' : 'rgba(59, 130, 246, 0.6)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
