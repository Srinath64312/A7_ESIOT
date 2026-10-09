import React from 'react';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <StatusBar />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
