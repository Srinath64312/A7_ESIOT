import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Cpu, Brain, Bell, History, Play, Settings, SettingsIcon, Globe } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';

export default function Sidebar() {
  const { isConnected } = useWebSocket();

  const links = [
    { to: '/', icon: Globe, label: 'Website Home' },
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/motors', icon: Cpu, label: 'Motors' },
    { to: '/analytics', icon: Brain, label: 'AI Analytics' },
    { to: '/alerts', icon: Bell, label: 'Alerts' },
    { to: '/history', icon: History, label: 'Historical Data' },
    { to: '/simulation', icon: Play, label: 'Simulation' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <SettingsIcon size={24} className="text-primary" />
        <span>AI-MotorGuard</span>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <span>v1.0.0</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
          <span>{isConnected ? 'Connected' : 'Offline'}</span>
        </div>
      </div>
    </aside>
  );
}
