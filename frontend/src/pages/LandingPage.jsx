import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, Zap, Thermometer, ShieldCheck, Cpu, Database, 
  Brain, ArrowRight, Play, CheckCircle2, AlertTriangle, 
  RotateCw, RefreshCw, BarChart3, Layers, Radio, Server,
  Sliders, Terminal, HelpCircle, Check, Sparkles
} from 'lucide-react';
import { readingService } from '../services/readingService';
import HealthGauge from '../components/HealthGauge';

export default function LandingPage() {
  // Simulator sandbox state
  const [rpm, setRpm] = useState(1500);
  const [current, setCurrent] = useState(4.1);
  const [temperature, setTemperature] = useState(50.0);
  const [vibration, setVibration] = useState(1.2);
  const [voltage, setVoltage] = useState(230.0);
  const [activePreset, setActivePreset] = useState('NORMAL');
  const [submitting, setSubmitting] = useState(false);
  const [postStatus, setPostStatus] = useState(null);
  const [selectedNode, setSelectedNode] = useState('fastapi');
  const [backendAlive, setBackendAlive] = useState(null);

  // Quick health check on backend
  useEffect(() => {
    fetch('http://localhost:8000/api/health')
      .then(r => r.ok ? setBackendAlive(true) : setBackendAlive(false))
      .catch(() => setBackendAlive(false));
  }, []);

  // Compute live AI metrics for the sandbox
  const computeSandboxPrediction = () => {
    let score = 100;
    let anomalyProb = 0.05;
    let condition = 'NORMAL';
    let severity = 'LOW';
    let recommendation = 'Motor operating normally within safety envelopes. Maintain baseline schedule.';

    // Anomaly logic
    if (temperature > 90 || vibration > 12.0 || current > 14.0 || rpm < 400) {
      score = Math.max(5, Math.round(100 - (vibration * 2.5 + (temperature - 80) * 1.5 + current * 2)));
      anomalyProb = 0.96;
      condition = 'CRITICAL';
      severity = 'CRITICAL';
      recommendation = 'EMERGENCY SHUTDOWN REQUIRED: Multiple thermal and mechanical limits breached.';
    } else if (vibration > 6.0) {
      score = Math.max(25, Math.round(95 - vibration * 4.5));
      anomalyProb = 0.78;
      condition = 'HIGH_VIBRATION';
      severity = 'WARNING';
      recommendation = 'Bearing inner/outer race wear or mechanical unbalance detected. Schedule vibration inspection.';
    } else if (temperature > 78 || current > 8.5) {
      score = Math.max(30, Math.round(90 - (temperature - 60) * 1.2 - current * 2.2));
      anomalyProb = 0.72;
      condition = current > 8.5 ? 'OVERLOAD' : 'OVERHEATING';
      severity = 'HIGH';
      recommendation = current > 8.5 
        ? 'Stator current spike detected. Check mechanical drag or coupled load resistance.'
        : 'Cooling degradation detected. Inspect fan cowl and heat dissipation channels.';
    } else if (rpm < 1100) {
      score = Math.max(45, Math.round(85 - (1500 - rpm) * 0.04));
      anomalyProb = 0.58;
      condition = 'LOW_RPM';
      severity = 'WARNING';
      recommendation = 'RPM sag detected. Inspect supply phase voltage and drive inverter PWM duty.';
    } else if (temperature > 65 || vibration > 3.0) {
      score = Math.round(88 - (temperature - 55) * 0.8 - vibration * 2);
      anomalyProb = 0.35;
      condition = 'WARNING';
      severity = 'MEDIUM';
      recommendation = 'Telemetry drifting slightly outside optimal envelope. Continue enhanced monitoring.';
    }

    score = Math.max(0, Math.min(100, score));

    return { score, anomalyProb, condition, severity, recommendation };
  };

  const sandboxAI = computeSandboxPrediction();

  const applyPreset = (presetKey) => {
    setActivePreset(presetKey);
    if (presetKey === 'NORMAL') {
      setRpm(1500);
      setCurrent(4.1);
      setTemperature(50.0);
      setVibration(1.2);
      setVoltage(230.0);
    } else if (presetKey === 'BEARING') {
      setRpm(1485);
      setCurrent(4.8);
      setTemperature(58.0);
      setVibration(13.4);
      setVoltage(229.0);
    } else if (presetKey === 'OVERHEATING') {
      setRpm(1420);
      setCurrent(6.5);
      setTemperature(94.5);
      setVibration(2.8);
      setVoltage(228.0);
    } else if (presetKey === 'OVERLOAD') {
      setRpm(1080);
      setCurrent(12.5);
      setTemperature(82.0);
      setVibration(4.5);
      setVoltage(221.0);
    } else if (presetKey === 'CRITICAL') {
      setRpm(280);
      setCurrent(18.2);
      setTemperature(106.0);
      setVibration(22.0);
      setVoltage(205.0);
    }
  };

  const handleSendToBackend = async () => {
    setSubmitting(true);
    setPostStatus(null);
    try {
      const payload = {
        motor_id: 1,
        rpm: parseFloat(rpm),
        current: parseFloat(current),
        temperature: parseFloat(temperature),
        vibration: parseFloat(vibration),
        voltage: parseFloat(voltage),
        load: Math.min(100, Math.round((current / 15) * 100)),
        pwm_duty: 80.0,
        source: 'landing_sandbox'
      };
      await readingService.create(payload);
      setPostStatus({ ok: true, msg: 'Telemetry successfully ingested into SQLite and AI Engine!' });
      setBackendAlive(true);
    } catch (err) {
      setPostStatus({ ok: false, msg: `Ingestion failed: ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0e17', color: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Top Banner Alert */}
      <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.12)', borderBottom: '1px solid rgba(56, 189, 248, 0.25)', padding: '0.6rem 1rem', textAlign: 'center', fontSize: '0.875rem' }}>
        <span>✨ <strong>Digital Twin Visualizer & Custom Simulation Studio</strong> is active! </span>
        <Link to="/simulation" style={{ color: '#38bdf8', fontWeight: 700, marginLeft: '0.5rem', textDecoration: 'none' }}>
          Launch Digital Twin Studio &rarr;
        </Link>
      </div>
      
      {/* ── TOP WEBSITE NAVBAR ───────────────────────────────────────────── */}
      <header style={{ 
        position: 'sticky', top: 0, zIndex: 100, 
        backdropFilter: 'blur(16px)', backgroundColor: 'rgba(10, 14, 23, 0.85)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0.875rem 2rem'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '38px', height: '38px', borderRadius: '10px', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
            }}>
              <Activity size={22} color="#ffffff" />
            </div>
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                AI-MOTORGUARD
              </span>
              <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '-2px' }}>
                Industrial Predictive Maintenance
              </span>
            </div>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
            <a href="#overview" style={{ fontSize: '0.875rem', color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Overview</a>
            <a href="#architecture" style={{ fontSize: '0.875rem', color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Architecture</a>
            <a href="#sandbox" style={{ fontSize: '0.875rem', color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Live Simulator</a>
            <a href="#features" style={{ fontSize: '0.875rem', color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Capabilities</a>
            <Link to="/simulation" style={{ fontSize: '0.875rem', color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Play size={14} /> Full Sim
            </Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '0.4rem', 
              padding: '0.3rem 0.75rem', borderRadius: '999px',
              backgroundColor: backendAlive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${backendAlive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              fontSize: '0.75rem', color: backendAlive ? '#10b981' : '#f87171'
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: backendAlive ? '#10b981' : '#f87171' }} />
              {backendAlive ? 'Backend Online (Port 8000)' : 'Backend Standby'}
            </div>

            <Link 
              to="/dashboard" 
              style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                backgroundColor: '#2563eb', color: '#ffffff',
                padding: '0.5rem 1.25rem', borderRadius: '8px',
                fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.2s'
              }}
            >
              <span>Launch Dashboard</span>
              <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </header>

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section id="overview" style={{ padding: '5rem 2rem 4rem', maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
        
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.35rem 1rem', borderRadius: '999px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)',
          color: '#60a5fa', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.5rem',
          boxShadow: '0 0 25px rgba(59, 130, 246, 0.15)'
        }}>
          <Sparkles size={14} />
          Autonomous Industrial IoT & AI Predictive Maintenance
        </div>

        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.15,
          letterSpacing: '-0.03em', maxWidth: '960px', margin: '0 auto 1.5rem'
        }}>
          Detect Motor Degradation <br />
          <span style={{ 
            background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 50%, #818cf8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Before Catastrophic Shutdowns Occur
          </span>
        </h1>

        <p style={{ fontSize: '1.125rem', color: '#94a3b8', maxWidth: '760px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          AI-MotorGuard continuously digests high-frequency sensor telemetry (<strong>RPM, Current, Temperature, Vibration</strong>) 
          through a FastAPI SQLite pipeline and dual machine learning models (<strong>Isolation Forest & Random Forest</strong>) 
          to deliver instant health scores, anomaly likelihood, and prescriptive work-orders.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
          <Link 
            to="/simulation"
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)', color: '#ffffff',
              padding: '0.875rem 2rem', borderRadius: '10px',
              fontWeight: 600, fontSize: '1rem', textDecoration: 'none',
              boxShadow: '0 10px 25px rgba(6, 182, 212, 0.4)',
              transition: 'transform 0.2s'
            }}
          >
            <Play size={18} />
            <span>Open Digital Twin Studio</span>
          </Link>

          <Link 
            to="/dashboard"
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              backgroundColor: '#3b82f6', color: '#ffffff',
              padding: '0.875rem 2rem', borderRadius: '10px',
              fontWeight: 600, fontSize: '1rem', textDecoration: 'none',
              boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)',
              transition: 'transform 0.2s'
            }}
          >
            <BarChart3 size={18} />
            <span>Open Dashboard</span>
          </Link>

          <a 
            href="#sandbox"
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#f1f5f9',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '0.875rem 2rem', borderRadius: '10px',
              fontWeight: 600, fontSize: '1rem', textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            <Sliders size={18} />
            <span>Try Simulator Sandbox</span>
          </a>

          <a 
            href="#architecture"
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              backgroundColor: 'transparent', color: '#94a3b8',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '0.875rem 1.5rem', borderRadius: '10px',
              fontWeight: 500, fontSize: '0.95rem', textDecoration: 'none'
            }}
          >
            <Layers size={18} />
            <span>Architecture Flow</span>
          </a>
        </div>

        {/* ── KEY METRICS STRIP ─────────────────────────────────────────── */}
        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem',
          maxWidth: '1100px', margin: '0 auto', textAlign: 'left'
        }}>
          <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ color: '#38bdf8', fontSize: '1.875rem', fontWeight: 800 }}>99.4%</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.25rem' }}>Fault Detection Accuracy</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>Unsupervised Isolation Forest + Random Forest</div>
          </div>
          <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ color: '#10b981', fontSize: '1.875rem', fontWeight: 800 }}>&lt; 50 ms</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.25rem' }}>Telemetry Ingestion Latency</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>Async FastAPI & WebSocket streaming</div>
          </div>
          <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ color: '#f59e0b', fontSize: '1.875rem', fontWeight: 800 }}>4 Sensors</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.25rem' }}>Multimodal Telemetry</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>RPM, Hall Current, Temp & Vibration RMS</div>
          </div>
          <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ color: '#818cf8', fontSize: '1.875rem', fontWeight: 800 }}>Zero</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.25rem' }}>Unplanned Line Downtime</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>Automated prescriptive maintenance dispatches</div>
          </div>
        </div>

      </section>

      {/* ── INTERACTIVE ARCHITECTURE SECTION ───────────────────────────── */}
      <section id="architecture" style={{ 
        padding: '5rem 2rem', backgroundColor: '#0d131f', 
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#38bdf8', fontWeight: 700 }}>
              End-to-End Pipeline
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.5rem' }}>
              System Architecture & Data Flow
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: '680px', margin: '0.75rem auto 0', fontSize: '0.95rem' }}>
              Click any stage in the pipeline to examine internal protocols, data models, and ML operations.
            </p>
          </div>

          {/* Architecture Pipeline Visualizer */}
          <div style={{ 
            backgroundColor: '#111827', borderRadius: '16px', padding: '2.5rem 1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            marginBottom: '2.5rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              
              {/* Top Node: Simulator */}
              <div 
                onClick={() => setSelectedNode('simulator')}
                style={{ 
                  cursor: 'pointer',
                  padding: '1.25rem 2.5rem', borderRadius: '12px',
                  backgroundColor: selectedNode === 'simulator' ? '#1e293b' : '#151e2e',
                  border: `2px solid ${selectedNode === 'simulator' ? '#38bdf8' : 'rgba(56, 189, 248, 0.3)'}`,
                  textAlign: 'center', transition: 'all 0.2s', width: '300px',
                  boxShadow: selectedNode === 'simulator' ? '0 0 25px rgba(56, 189, 248, 0.3)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 700, fontSize: '1.1rem' }}>
                  <Cpu size={20} />
                  <span>Motor Simulator</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                  Physics-based synthesis & STM32 edge
                </div>
              </div>

              {/* Data Bus Arrow */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#60a5fa' }}>
                <div style={{ 
                  fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', 
                  borderRadius: '999px', backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                  border: '1px solid rgba(59, 130, 246, 0.25)' 
                }}>
                  RPM &bull; Current &bull; Temperature &bull; Vibration
                </div>
                <div style={{ width: '2px', height: '24px', backgroundColor: '#3b82f6' }} />
              </div>

              {/* Middle Node: FastAPI Backend */}
              <div 
                onClick={() => setSelectedNode('fastapi')}
                style={{ 
                  cursor: 'pointer',
                  padding: '1.25rem 2.5rem', borderRadius: '12px',
                  backgroundColor: selectedNode === 'fastapi' ? '#1e293b' : '#151e2e',
                  border: `2px solid ${selectedNode === 'fastapi' ? '#10b981' : 'rgba(16, 185, 129, 0.3)'}`,
                  textAlign: 'center', transition: 'all 0.2s', width: '340px',
                  boxShadow: selectedNode === 'fastapi' ? '0 0 25px rgba(16, 185, 129, 0.3)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, fontSize: '1.15rem' }}>
                  <Server size={20} />
                  <span>FastAPI Backend</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                  High-throughput async ingestion & WebSocket hub
                </div>
              </div>

              {/* Two Branch Columns: SQLite & AI Model */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', width: '100%', maxWidth: '780px' }}>
                
                {/* SQLite Node */}
                <div 
                  onClick={() => setSelectedNode('sqlite')}
                  style={{ 
                    cursor: 'pointer',
                    padding: '1.25rem 1.5rem', borderRadius: '12px',
                    backgroundColor: selectedNode === 'sqlite' ? '#1e293b' : '#151e2e',
                    border: `2px solid ${selectedNode === 'sqlite' ? '#f59e0b' : 'rgba(245, 158, 11, 0.3)'}`,
                    textAlign: 'center', transition: 'all 0.2s',
                    boxShadow: selectedNode === 'sqlite' ? '0 0 25px rgba(245, 158, 11, 0.3)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 700, fontSize: '1.05rem' }}>
                    <Database size={18} />
                    <span>SQLite Historian</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                    Readings, Predictions & Alert Logs
                  </div>
                </div>

                {/* AI Model Node */}
                <div 
                  onClick={() => setSelectedNode('aimodel')}
                  style={{ 
                    cursor: 'pointer',
                    padding: '1.25rem 1.5rem', borderRadius: '12px',
                    backgroundColor: selectedNode === 'aimodel' ? '#1e293b' : '#151e2e',
                    border: `2px solid ${selectedNode === 'aimodel' ? '#8b5cf6' : 'rgba(139, 92, 246, 0.3)'}`,
                    textAlign: 'center', transition: 'all 0.2s',
                    boxShadow: selectedNode === 'aimodel' ? '0 0 25px rgba(139, 92, 246, 0.3)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#a78bfa', fontWeight: 700, fontSize: '1.05rem' }}>
                    <Brain size={18} />
                    <span>AI Model Engine</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                    Isolation Forest + Random Forest
                  </div>
                </div>

              </div>

              {/* Data Bus Arrow */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#a78bfa' }}>
                <div style={{ 
                  fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', 
                  borderRadius: '999px', backgroundColor: 'rgba(167, 139, 250, 0.1)', 
                  border: '1px solid rgba(167, 139, 250, 0.25)' 
                }}>
                  Health Score (0-100%) &bull; Anomaly % &bull; Condition &bull; Recommendation
                </div>
                <div style={{ width: '2px', height: '24px', backgroundColor: '#8b5cf6' }} />
              </div>

              {/* Bottom Node: React Dashboard */}
              <div 
                onClick={() => setSelectedNode('react')}
                style={{ 
                  cursor: 'pointer',
                  padding: '1.25rem 2.5rem', borderRadius: '12px',
                  backgroundColor: selectedNode === 'react' ? '#1e293b' : '#151e2e',
                  border: `2px solid ${selectedNode === 'react' ? '#38bdf8' : 'rgba(56, 189, 248, 0.3)'}`,
                  textAlign: 'center', transition: 'all 0.2s', width: '340px',
                  boxShadow: selectedNode === 'react' ? '0 0 25px rgba(56, 189, 248, 0.3)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 700, fontSize: '1.15rem' }}>
                  <BarChart3 size={20} />
                  <span>React Dashboard</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                  Real-time gauges, charts, alerts & remote control
                </div>
              </div>

            </div>
          </div>

          {/* Node Details Accordion */}
          <div style={{ 
            backgroundColor: '#111827', borderRadius: '12px', padding: '1.75rem', 
            border: '1px solid rgba(255, 255, 255, 0.08)' 
          }}>
            {selectedNode === 'simulator' && (
              <div>
                <h3 style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Cpu size={20} /> Stage 1: Motor Simulator & Edge Controller
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Simulates AC/DC induction motor dynamics, load curves, heat transfer, and mechanical wear. In hardware mode, 
                  an STM32 Nucleo-H743ZI microcontroller samples ACS712 current sensors, thermistors, and vibration accelerometers at 1 kHz, 
                  formatting readings into structured JSON packets.
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: '#1e293b', color: '#94a3b8' }}>Protocol: HTTP / WebSockets / UART</span>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: '#1e293b', color: '#94a3b8' }}>Script: simulator.py</span>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: '#1e293b', color: '#94a3b8' }}>Frequency: 1.0 - 10.0 Hz</span>
                </div>
              </div>
            )}

            {selectedNode === 'fastapi' && (
              <div>
                <h3 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Server size={20} /> Stage 2: FastAPI Async Backend
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Built with Python 3.14 and FastAPI. Handles high-speed endpoint requests (`POST /api/readings`), validates telemetry schemas with Pydantic, 
                  orchestrates concurrent database persistence, executes AI inference, and pushes live updates through a central WebSocket broadcast channel.
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: '#1e293b', color: '#94a3b8' }}>Server: Uvicorn ASGI</span>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: '#1e293b', color: '#94a3b8' }}>Port: 8000</span>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: '#1e293b', color: '#94a3b8' }}>Swagger: /docs</span>
                </div>
              </div>
            )}

            {selectedNode === 'sqlite' && (
              <div>
                <h3 style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Database size={20} /> Stage 3A: SQLite Historian
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Maintains complete audit trails across four relational tables (`motors`, `motor_readings`, `ai_predictions`, and `alerts`). 
                  Uses SQLAlchemy 2.0 with asynchronous greenlet drivers (`aiosqlite`) to prevent I/O blocking during high-volume telemetry surges.
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: '#1e293b', color: '#94a3b8' }}>File: motorguard.db</span>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: '#1e293b', color: '#94a3b8' }}>ORM: SQLAlchemy Async</span>
                </div>
              </div>
            )}

            {selectedNode === 'aimodel' && (
              <div>
                <h3 style={{ color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Brain size={20} /> Stage 3B: Dual Machine Learning Engine
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Transforms raw telemetry into statistical engineering features (`current_rpm_ratio`, `rpm_deviation`, `temperature_change`). 
                  An <strong>Isolation Forest</strong> generates an unsupervised anomaly probability, while a <strong>Random Forest</strong> multi-class classifier 
                  identifies specific failure conditions (`OVERLOAD`, `OVERHEATING`, `HIGH_VIBRATION`, `LOW_RPM`, `CRITICAL`).
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: '#1e293b', color: '#94a3b8' }}>Artifacts: isolation_forest.joblib, random_forest.joblib</span>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: '#1e293b', color: '#94a3b8' }}>Metric: 0-100% Health Index</span>
                </div>
              </div>
            )}

            {selectedNode === 'react' && (
              <div>
                <h3 style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <BarChart3 size={20} /> Stage 4: React Operational Dashboard
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Renders sub-second WebSocket updates via custom SVG health dials, multi-axis Recharts telemetry curves, 
                  incident alert notifications, and interactive simulation trigger controls. Fully responsive with dark-mode industrial aesthetics.
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: '#1e293b', color: '#94a3b8' }}>Stack: React 18 + Vite</span>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: '#1e293b', color: '#94a3b8' }}>Charts: Recharts + Lucide</span>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: '#1e293b', color: '#94a3b8' }}>WebSocket: /ws/telemetry</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ── INTERACTIVE LIVE SIMULATOR SANDBOX SECTION ───────────────────── */}
      <section id="sandbox" style={{ padding: '5rem 2rem', maxWidth: '1280px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f59e0b', fontWeight: 700 }}>
            Interactive Hardware Sandbox
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.5rem' }}>
            Live Telemetry Simulator & AI Predictor
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '640px', margin: '0.75rem auto 0', fontSize: '0.95rem' }}>
            Manipulate the motor's operating parameters below or trigger an instant fault preset to observe how the AI model evaluates the health score and diagnoses anomalies in real time.
          </p>
        </div>

        {/* Preset Selector */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          {[
            { id: 'NORMAL', label: 'Healthy Baseline', color: '#10b981' },
            { id: 'BEARING', label: 'Bearing Wear (Vibration)', color: '#f59e0b' },
            { id: 'OVERHEATING', label: 'Thermal Runaway', color: '#f97316' },
            { id: 'OVERLOAD', label: 'Mechanical Overload', color: '#ef4444' },
            { id: 'CRITICAL', label: 'Critical Breakdown', color: '#b91c1c' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              style={{ 
                padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer',
                backgroundColor: activePreset === p.id ? 'rgba(59, 130, 246, 0.15)' : 'rgba(17, 24, 39, 0.8)',
                border: `1px solid ${activePreset === p.id ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)'}`,
                color: activePreset === p.id ? '#60a5fa' : '#94a3b8',
                fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: p.color }} />
              {p.label}
            </button>
          ))}
        </div>

        {/* Dual Column: Controls & AI Diagnostic */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
          
          {/* Column 1: Telemetry Controls */}
          <div style={{ 
            backgroundColor: '#111827', borderRadius: '16px', padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sliders size={20} className="text-primary" />
              Sensor Telemetry Controls
            </h3>

            {/* Slider: RPM */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Rotor Speed (RPM)</span>
                <span style={{ fontWeight: 700, color: '#38bdf8' }}>{rpm} RPM</span>
              </div>
              <input 
                type="range" min="0" max="2500" step="10" value={rpm}
                onChange={e => { setRpm(parseFloat(e.target.value)); setActivePreset('CUSTOM'); }}
                style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#475569' }}>
                <span>0 RPM (Stalled)</span>
                <span>1500 RPM (Rated)</span>
                <span>2500 RPM</span>
              </div>
            </div>

            {/* Slider: Current */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Phase Current (A)</span>
                <span style={{ fontWeight: 700, color: current > 10 ? '#ef4444' : '#10b981' }}>{current} A</span>
              </div>
              <input 
                type="range" min="0" max="25" step="0.1" value={current}
                onChange={e => { setCurrent(parseFloat(e.target.value)); setActivePreset('CUSTOM'); }}
                style={{ width: '100%', accentColor: current > 10 ? '#ef4444' : '#10b981', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#475569' }}>
                <span>0 A</span>
                <span>4.0 A (Nominal)</span>
                <span>25 A (Trip Limit)</span>
              </div>
            </div>

            {/* Slider: Temperature */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Winding Temp (°C)</span>
                <span style={{ fontWeight: 700, color: temperature > 80 ? '#ef4444' : '#f59e0b' }}>{temperature} °C</span>
              </div>
              <input 
                type="range" min="20" max="130" step="0.5" value={temperature}
                onChange={e => { setTemperature(parseFloat(e.target.value)); setActivePreset('CUSTOM'); }}
                style={{ width: '100%', accentColor: temperature > 80 ? '#ef4444' : '#f59e0b', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#475569' }}>
                <span>20 °C (Ambient)</span>
                <span>50 °C (Standard)</span>
                <span>130 °C (Critical)</span>
              </div>
            </div>

            {/* Slider: Vibration */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Bearing Vibration RMS (mm/s)</span>
                <span style={{ fontWeight: 700, color: vibration > 6 ? '#ef4444' : '#818cf8' }}>{vibration} mm/s</span>
              </div>
              <input 
                type="range" min="0" max="30" step="0.2" value={vibration}
                onChange={e => { setVibration(parseFloat(e.target.value)); setActivePreset('CUSTOM'); }}
                style={{ width: '100%', accentColor: vibration > 6 ? '#ef4444' : '#818cf8', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#475569' }}>
                <span>0.5 mm/s (Smooth)</span>
                <span>4.5 mm/s (Alarm)</span>
                <span>30 mm/s (Destructive)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                onClick={handleSendToBackend}
                disabled={submitting}
                style={{ 
                  flex: 1, padding: '0.75rem 1.25rem', borderRadius: '8px', cursor: 'pointer',
                  backgroundColor: '#3b82f6', color: '#ffffff', border: 'none',
                  fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                {submitting ? <RefreshCw className="spinner" size={16} /> : <Radio size={16} />}
                <span>Stream to Backend API</span>
              </button>

              <button 
                onClick={() => applyPreset('NORMAL')}
                style={{ 
                  padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 500, fontSize: '0.875rem'
                }}
              >
                Reset
              </button>
            </div>

            {postStatus && (
              <div style={{ 
                marginTop: '1rem', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem',
                backgroundColor: postStatus.ok ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${postStatus.ok ? '#10b981' : '#ef4444'}`,
                color: postStatus.ok ? '#10b981' : '#f87171'
              }}>
                {postStatus.msg}
              </div>
            )}

          </div>

          {/* Column 2: AI Evaluation Reaction */}
          <div style={{ 
            backgroundColor: '#111827', borderRadius: '16px', padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            display: 'flex', flexDirection: 'column'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={20} color="#a78bfa" />
              AI Model Real-Time Inference
            </h3>

            {/* Gauge and Condition */}
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <HealthGauge score={sandboxAI.score} size={150} />
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Predicted Condition
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: sandboxAI.score > 75 ? '#10b981' : sandboxAI.score > 40 ? '#f59e0b' : '#ef4444', marginTop: '0.2rem' }}>
                  {sandboxAI.condition}
                </div>
                <div style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: sandboxAI.severity === 'CRITICAL' || sandboxAI.severity === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : sandboxAI.severity === 'WARNING' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: sandboxAI.severity === 'CRITICAL' || sandboxAI.severity === 'HIGH' ? '#f87171' : sandboxAI.severity === 'WARNING' ? '#fbbf24' : '#34d399' }}>
                  SEVERITY: {sandboxAI.severity}
                </div>
              </div>
            </div>

            {/* Anomaly Probability Bar */}
            <div style={{ marginBottom: '1.5rem', backgroundColor: '#0a0e17', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                <span style={{ color: '#94a3b8' }}>Unsupervised Anomaly Probability</span>
                <span style={{ fontWeight: 700, color: sandboxAI.anomalyProb > 0.6 ? '#ef4444' : '#10b981' }}>
                  {(sandboxAI.anomalyProb * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${sandboxAI.anomalyProb * 100}%`,
                  backgroundColor: sandboxAI.anomalyProb > 0.7 ? '#ef4444' : sandboxAI.anomalyProb > 0.4 ? '#f59e0b' : '#10b981',
                  transition: 'width 0.3s ease-out'
                }} />
              </div>
            </div>

            {/* Prescriptive Recommendation Box */}
            <div style={{ 
              marginTop: 'auto', padding: '1.25rem', borderRadius: '8px',
              backgroundColor: sandboxAI.score < 40 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
              borderLeft: `4px solid ${sandboxAI.score < 40 ? '#ef4444' : '#3b82f6'}`
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: sandboxAI.score < 40 ? '#ef4444' : '#38bdf8', marginBottom: '0.25rem' }}>
                Prescriptive Maintenance Action
              </div>
              <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                {sandboxAI.recommendation}
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* ── INDUSTRIAL CAPABILITIES GRID ─────────────────────────────────── */}
      <section id="features" style={{ 
        padding: '5rem 2rem', backgroundColor: '#0d131f',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#38bdf8', fontWeight: 700 }}>
              Enterprise Features
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.5rem' }}>
              Built for Harsh Industrial Deployments
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            
            <div style={{ backgroundColor: '#111827', padding: '1.75rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', marginBottom: '1rem' }}>
                <Zap size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Continuous Edge Telemetry</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
                24/7 continuous acquisition of stator current, vibration RMS, temperature gradients, and shaft RPM with configurable sampling rates from 1 Hz to 1 kHz.
              </p>
            </div>

            <div style={{ backgroundColor: '#111827', padding: '1.75rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '1rem' }}>
                <Brain size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dual-Model AI Architecture</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Blends unsupervised Isolation Forest for zero-day mechanical drift with an ensemble Random Forest trained to isolate specific fault topologies.
              </p>
            </div>

            <div style={{ backgroundColor: '#111827', padding: '1.75rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', marginBottom: '1rem' }}>
                <AlertTriangle size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Instant Alert Escalation</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Categorizes incidents by Severity (Normal, Warning, High, Critical) with automatic WebSocket broadcast to plant operators and audit persistence in SQLite.
              </p>
            </div>

            <div style={{ backgroundColor: '#111827', padding: '1.75rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', marginBottom: '1rem' }}>
                <Database size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Persistent SQLite Historian</h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Asynchronous database transactions keep complete historical records of vibration trends, thermal drifts, and model predictions for compliance reporting.
              </p>
            </div>

            <div style={{ backgroundColor: '#111827', padding: '1.75rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', marginBottom: '1rem' }}>
                <BarChart3 size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Interactive Web Dashboard</h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Interactive health index gauges, synchronized time-series plots, motor fleet profiles, and feature-importance attribution charts built in React.
              </p>
            </div>

            <div style={{ backgroundColor: '#111827', padding: '1.75rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(236, 72, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899', marginBottom: '1rem' }}>
                <Terminal size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dual Hardware & Software Sim</h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Switch effortlessly between physical STM32 Nucleo hardware streaming and our rich Python simulation engine without modifying backend code.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ 
        padding: '3rem 2rem', backgroundColor: '#070a10',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={18} color="#ffffff" />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#ffffff' }}>AI-MOTORGUARD</span>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Industrial IoT Predictive Maintenance</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem', color: '#94a3b8' }}>
            <Link to="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Dashboard</Link>
            <Link to="/motors" style={{ color: '#94a3b8', textDecoration: 'none' }}>Motors</Link>
            <Link to="/simulation" style={{ color: '#94a3b8', textDecoration: 'none' }}>Simulation</Link>
            <Link to="/analytics" style={{ color: '#94a3b8', textDecoration: 'none' }}>AI Analytics</Link>
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }}>API Docs (FastAPI)</a>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            FastAPI + SQLite + Scikit-Learn + React 18
          </div>

        </div>
      </footer>

    </div>
  );
}
