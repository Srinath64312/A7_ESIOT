import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Motors from './pages/Motors';
import MotorDetails from './pages/MotorDetails';
import AIAnalytics from './pages/AIAnalytics';
import Alerts from './pages/Alerts';
import HistoricalData from './pages/HistoricalData';
import Simulation from './pages/Simulation';
import Settings from './pages/Settings';

function App() {
  return (
    <Routes>
      {/* High-Tech Product & Platform Website */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<LandingPage />} />

      {/* Operational Dashboard Console Suite */}
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/motors" element={<Layout><Motors /></Layout>} />
      <Route path="/motors/:id" element={<Layout><MotorDetails /></Layout>} />
      <Route path="/analytics" element={<Layout><AIAnalytics /></Layout>} />
      <Route path="/alerts" element={<Layout><Alerts /></Layout>} />
      <Route path="/history" element={<Layout><HistoricalData /></Layout>} />
      <Route path="/simulation" element={<Layout><Simulation /></Layout>} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />
    </Routes>
  );
}

export default App;
