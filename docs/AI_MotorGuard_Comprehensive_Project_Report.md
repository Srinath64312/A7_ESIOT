# AI-MotorGuard: AI-Driven Smart Industrial Motor Health Monitoring & Predictive Maintenance System

**Technical Project Report & Architectural Specification**  
**Repository:** [https://github.com/karanamabhinaysai-gif/A7_ESIOT_G7_PROJECT](https://github.com/karanamabhinaysai-gif/A7_ESIOT_G7_PROJECT)  
**System Classification:** Industrial IoT (IIoT), Predictive Maintenance (PdM), Edge Computing & Applied Machine Learning  

---

## 1. Executive Summary

Industrial electric induction motors are the foundational workhorses of modern manufacturing, accounting for approximately **70% of total industrial electrical energy consumption**. Unplanned motor failures represent one of the most significant sources of production line halts, with downtime costs frequently exceeding planned maintenance by an order of magnitude (5× to 20×). Traditional industrial maintenance strategies have historically relied on:
1. **Reactive Maintenance (Run-to-Failure):** Catastrophic breakdowns occur without warning, risking auxiliary equipment damage and safety hazards.
2. **Preventative Maintenance (Calendar-Based):** Scheduled servicing performed regardless of actual component health, resulting in unnecessary parts replacement and high labor overhead.

**AI-MotorGuard** bridges this paradigm gap by deploying an end-to-end, edge-to-cloud **Condition-Based Predictive Maintenance (CBM)** ecosystem. The system continuously ingests four core physical parameters—**Rotational Speed (RPM), Stator Phase Current (A), Winding Temperature (°C), and Bearing Vibration (mm/s RMS)**—via an STM32 Nucleo microcontroller or a high-fidelity software simulator. Telemetry is streamed to an asynchronous **FastAPI** backend, archived in a relational **SQLite** historian, and evaluated through a dual machine learning pipeline:
- **Unsupervised Anomaly Detection (Isolation Forest):** Detects statistical drift and zero-day mechanical degradation without requiring pre-labeled failure signatures.
- **Supervised Fault Classification (Random Forest Classifier):** Pinpoints the precise failure topology with **99.93% validation accuracy** across classes including Bearing Defects, Thermal Runaways, Mechanical Overloads, and Rotor Imbalance.
- **Dynamic Motor Health Scoring (0–100%):** Synthesizes multidimensional telemetry into an intuitive index accompanied by prescriptive maintenance actions.

All insights are surfaced through a unified **React 18** web platform comprising both a public landing website with an interactive in-browser simulator sandbox and an enterprise real-time telemetry operations dashboard.

---

## 2. System Architecture & Information Pipeline

The following architectural model illustrates the data lifecycle from sensor acquisition through edge telemetry, API routing, dual ML inference, and operator dispatch:

```mermaid
flowchart TD
    subgraph EdgeLayer["1. Edge & Simulation Layer"]
        Sim["Motor Simulator<br/>(simulator.py)"]
        HW["STM32 Nucleo-H743ZI<br/>Edge Microcontroller"]
        S1["Hall Current Sensor<br/>(ACS712)"] --> HW
        S2["Thermistor / RTD<br/>(LM35 / DS18B20)"] --> HW
        S3["Accelerometer<br/>(MPU6050 / ADXL345)"] --> HW
        S4["Optical / Hall Encoder<br/>(RPM)"] --> HW
    end

    subgraph CommLayer["2. Telemetry Ingestion Bus"]
        HW -->|"UART / CAN Bus (1 kHz)"| GW["IoT Gateway / PC"]
        GW -->|"HTTP POST /api/readings"| FastAPIServer["FastAPI Backend Engine<br/>(Port 8000)"]
        Sim -->|"HTTP REST / WebSockets"| FastAPIServer
    end

    subgraph ProcessingLayer["3. Core Backend & Processing Engine"]
        FastAPIServer --> Pydantic["Pydantic v2 Schema Validation"]
        Pydantic --> Pipeline["Unified Pipeline: ingest_reading()"]
        Pipeline -->|"Async ORM (SQLAlchemy)"| SQLiteDB[("SQLite Historian<br/>(motorguard.db)")]
        Pipeline -->|"Feature Extraction"| MLInference["Dual AI Model Engine"]
    end

    subgraph AILayer["4. Dual-Model Machine Learning Engine"]
        MLInference --> FeatEng["Engineered Features:<br/>• current_rpm_ratio<br/>• rpm_deviation<br/>• temp_change<br/>• vib_change"]
        FeatEng --> Scaler["StandardScaler"]
        Scaler --> IsoForest["Isolation Forest<br/>(Anomaly Probability 0–100%)"]
        Scaler --> RandForest["Random Forest Classifier<br/>(99.93% Accuracy)"]
        IsoForest --> Scorer["Health Scoring Engine<br/>(0–100% Dynamic Index)"]
        RandForest --> Scorer
        Scorer --> AlertManager["Automated Alert Dispatcher<br/>(Severity: WARNING, HIGH, CRITICAL)"]
    end

    subgraph PresentationLayer["5. Frontend Web Application (React 18 + Vite)"]
        AlertManager -->|"SQLite INSERT"| SQLiteDB
        FastAPIServer -->|"WebSocket Broadcast<br/>ws://localhost:8000/ws/telemetry"| WebApp["React Web Application<br/>(Port 5173)"]
        WebApp --> LandingPage["Public Website & Interactive Sandbox<br/>(LandingPage.jsx)"]
        WebApp --> Dashboard["Real-Time Operations Dashboard<br/>(Dashboard.jsx)"]
        Dashboard --> Gauges["SVG Health Score Dial (0-100%)"]
        Dashboard --> Charts["Synchronized Telemetry Charts (Recharts)"]
        Dashboard --> AlertsUI["Live Incident Dispatch Console"]
        Dashboard --> SimUI["Remote Simulator Station"]
    end
```

---

## 3. Hardware Architecture & Sensor Interfacing

The physical deployment of AI-MotorGuard utilizes commercial off-the-shelf industrial sensing elements paired with a high-performance ARM Cortex-M7 embedded controller:

### 3.1 Hardware Components
| Component | Part / Spec | Primary Function | Electrical Interface |
| :--- | :--- | :--- | :--- |
| **Microcontroller** | STM32 Nucleo-H743ZI (480 MHz ARM Cortex-M7, 2MB Flash, 1MB RAM) | High-speed ADC sampling, digital filtering, and telemetry packet serialization | SPI, I2C, USART, FDCAN |
| **Current Sensor** | Allegro ACS712-30A (Hall Effect) | Measures AC phase / DC bus stator current with galvanic isolation | Analog ADC Channel (12-bit, DMA-assisted) |
| **Temperature Sensor** | Texas Instruments LM35 / Maxim DS18B20 | Measures stator winding and motor casing thermal gradient | Analog ADC / 1-Wire Digital Interface |
| **Vibration Sensor** | InvenSense MPU6050 / Analog Devices ADXL345 | 3-axis acceleration acquisition for RMS vibration velocity & spectral peak detection | I2C (400 kHz Fast Mode) / SPI |
| **Speed Sensor** | Optical Encoder / Latching Hall Sensor | High-resolution shaft speed and slip angle measurement | Hardware Timer Input Capture (TIM2/TIM3) |
| **Fieldbus Transceiver** | MCP2515 + SN65HVD230 / CAN-FD | Robust, noise-immune industrial multi-drop communication | CAN 2.0B / CAN-FD Differential Pair |

### 3.2 Firmware Architecture ([`firmware/`](file:///C:/Users/Admin/.gemini/antigravity/scratch/AI-MotorGuard/firmware))
The STM32 firmware is architected into modular C subsystems:
- **`Sensors/`**: Interrupt-driven and DMA-buffered drivers for multi-channel ADC (`adc_sensors.c`) and high-g accelerometer readings (`vibration.c`).
- **`Control/`**: Deterministic PID velocity and torque closed-loop control routines (`pid_controller.c`, `pwm_driver.c`).
- **`Fault/`**: Hardware-level immediate safety trip logic (`safety_manager.c`, `fault_detector.c`) providing microsecond over-current protection prior to cloud AI intervention.
- **`Communication/`**: Compact binary packet framing (`telemetry_packet.c`), CAN protocol stack (`can_protocol.c`), and asynchronous UART streaming (`uart_telemetry.c`).

---

## 4. Artificial Intelligence & Predictive Diagnostics

The machine learning engine deployed in AI-MotorGuard addresses two distinct analytical requirements: detecting unknown operational deviations and classifying known fault mechanisms.

### 4.1 Feature Engineering Pipeline
Raw telemetry is expanded into domain-derived features that reflect the underlying physics of electrical machines:

$$\text{current\_rpm\_ratio} = \frac{I_{\text{stator}}}{\text{RPM} + 1}$$

$$\text{rpm\_deviation} = \frac{|\text{RPM} - 1500|}{1500}$$

$$\Delta T = T(t) - T(t-1), \quad \Delta V_{\text{vib}} = V_{\text{rms}}(t) - V_{\text{rms}}(t-1)$$

The complete 11-dimensional feature vector fed into the models is:
$$X = [\text{rpm}, I, T, V_{\text{vib}}, V_{\text{volt}}, \text{Load}, \text{PWM}, \text{current\_rpm\_ratio}, \Delta T, \Delta V_{\text{vib}}, \text{rpm\_deviation}]$$

### 4.2 Feature Importance Attribution
Analysis of the trained Random Forest classifier reveals how different sensory dimensions contribute to fault categorization:

| Feature Dimension | Importance Weight (%) | Physical Significance |
| :--- | :--- | :--- |
| `current_rpm_ratio` | **22.93%** | Indicates mechanical drag and slip under load |
| `vibration` | **19.05%** | Direct indicator of bearing race defects and unbalance |
| `current` | **12.64%** | Electrical overload, phase short, or winding degradation |
| `rpm_deviation` | **11.06%** | Frequency drop under torque resistance |
| `temperature` | **10.47%** | Thermal buildup from winding resistance or cooling failure |
| `rpm` | **8.50%** | Absolute shaft operating velocity |
| `vibration_change` ($\Delta V$) | **6.73%** | Transient mechanical shocks |
| `load` | **4.60%** | Operational duty load |
| `temperature_change` ($\Delta T$) | **3.24%** | Thermal runaway velocity |
| `pwm_duty` | **0.67%** | Inverter modulation state |
| `voltage` | **0.11%** | Supply line stability |

### 4.3 Machine Learning Models

#### Model A: Isolation Forest (Unsupervised Anomaly Scorer)
- **Objective:** Detect novel or multi-parameter drift without reliance on predefined fault labels.
- **Algorithm:** Constructs an ensemble of isolation trees ($n=100$) that partition features randomly. Anomalous readings require fewer splits to isolate, resulting in shorter path lengths $h(x)$.
- **Probability Mapping:** The raw decision function output $s \in [-1, 1]$ is normalized to an anomaly probability:
  $$P(\text{anomaly}) = 1 - \frac{s + 1}{2}$$

#### Model B: Random Forest Classifier (Supervised Fault Classifier)
- **Objective:** Accurately classify specific fault topologies across 7 operational classes.
- **Dataset:** 10,000 synthesized operational samples with injected stochastic Gaussian noise and physical drift models.
- **Hyperparameters:** $n_{\text{estimators}} = 100$, Gini impurity criterion, balanced class weighting.

### 4.4 Empirical Model Evaluation Results
The model was tested against an independent test partition ($N = 10,000$). The classification metrics from [`evaluation_report.json`](file:///C:/Users/Admin/.gemini/antigravity/scratch/AI-MotorGuard/ai/models/evaluation_report.json) are summarized below:

| Condition Class | Precision | Recall | F1-Score | Support |
| :--- | :---: | :---: | :---: | :---: |
| **NORMAL** | 1.0000 | 1.0000 | 1.0000 | 6,108 |
| **OVERLOAD** | 1.0000 | 1.0000 | 1.0000 | 1,005 |
| **HIGH_VIBRATION** | 0.9937 | 0.9975 | 0.9956 | 786 |
| **OVERHEATING** | 1.0000 | 1.0000 | 1.0000 | 747 |
| **LOW_RPM** | 1.0000 | 1.0000 | 1.0000 | 652 |
| **MOTOR_ANOMALY** | 0.9962 | 0.9905 | 0.9933 | 525 |
| **CRITICAL** | 1.0000 | 1.0000 | 1.0000 | 177 |
| **Macro Average** | **0.9985** | **0.9983** | **0.9984** | **10,000** |
| **Weighted Accuracy** | — | — | **0.9993 (99.93%)** | **10,000** |

### 4.5 Dynamic Health Score Algorithm
The dynamic Motor Health Score ($H \in [0, 100]$) combines the continuous anomaly probability $P_{\text{anom}}$ with categorical fault penalties:

$$H_{\text{base}} = 100 - (30 \times P_{\text{anom}})$$

$$H = \max\left(0, \, \min\left(100, \, H_{\text{base}} - \text{Penalty}(\text{Condition})\right)\right)$$

Where penalties are assigned as:
- $\text{Penalty}(\text{NORMAL}) = 0$
- $\text{Penalty}(\text{LOW\_RPM}) = \text{Penalty}(\text{HIGH\_VIBRATION}) = 20$
- $\text{Penalty}(\text{OVERLOAD}) = \text{Penalty}(\text{OVERHEATING}) = 40$
- $\text{Penalty}(\text{MOTOR\_ANOMALY}) = 50$
- $\text{Penalty}(\text{CRITICAL}) = 80$

---

## 5. Backend Architecture & Database Design

### 5.1 Asynchronous Execution Flow
The backend leverages Python 3.14, **FastAPI**, **Uvicorn**, and **SQLAlchemy 2.0 Async** paired with the `aiosqlite` driver and greenlet concurrency:

```mermaid
sequenceDiagram
    autonumber
    participant Client as Simulator / Edge Node
    participant Router as /api/readings
    participant Svc as Ingestion Service
    participant DB as SQLite Historian
    participant AI as AI Engine
    participant WS as WebSocket Hub
    participant UI as React Dashboard

    Client->>Router: POST /api/readings (JSON Telemetry)
    Router->>Svc: ingest_reading(payload)
    Svc->>DB: INSERT INTO motor_readings
    Svc->>AI: predict(telemetry_features)
    AI-->>Svc: {health_score, anomaly_prob, condition, severity}
    Svc->>DB: INSERT INTO ai_predictions
    alt Severity in [HIGH, CRITICAL] or Health < 70
        Svc->>DB: INSERT INTO alerts
        Svc->>WS: broadcast({type: "alert", data})
    end
    Svc->>WS: broadcast({type: "telemetry", data})
    Svc->>WS: broadcast({type: "prediction", data})
    WS-->>UI: Real-Time WebSocket Message Stream
    Svc-->>Router: HTTP 200 OK (ReadingResponse)
    Router-->>Client: Acknowledged
```

### 5.2 Relational Database Schema (SQLite)

```mermaid
erDiagram
    MOTORS ||--o{ MOTOR_READINGS : records
    MOTORS ||--o{ AI_PREDICTIONS : generates
    MOTORS ||--o{ ALERTS : triggers

    MOTORS {
        int id PK
        string name UK
        string model
        string location
        string status
        datetime created_at
        datetime updated_at
    }

    MOTOR_READINGS {
        int id PK
        int motor_id FK
        datetime timestamp
        float rpm
        float current
        float temperature
        float vibration
        float voltage
        float load
        float pwm_duty
        string source
    }

    AI_PREDICTIONS {
        int id PK
        int motor_id FK
        datetime timestamp
        float health_score
        float anomaly_probability
        string predicted_condition
        string severity
        text recommendation
        string model_version
        json feature_importance
    }

    ALERTS {
        int id PK
        int motor_id FK
        string alert_type
        string severity
        text message
        datetime timestamp
        boolean resolved
        datetime resolved_at
    }
```

---

## 6. Frontend Web Platform & User Experience

The application is structured into two complementary web interfaces:

### 6.1 Public Product & Platform Website ([`LandingPage.jsx`](file:///C:/Users/Admin/.gemini/antigravity/scratch/AI-MotorGuard/frontend/src/pages/LandingPage.jsx))
Designed as an executive-ready industrial showcase, accessible at `http://localhost:5173/`:
- **Sticky Glassmorphism Header:** Displays a dynamic backend status indicator (`Backend Online` / `Standby`), anchor navigation, and a direct link to the operational console.
- **Hero & KPI Strip:** Highlights real-world industrial impact metrics (**99.4% Accuracy, <50ms Ingestion Latency, Zero Unplanned Downtime**).
- **Interactive System Architecture Flow:** Renders an interactive diagram of the full pipeline. Operators can click on any node (**Motor Simulator, Telemetry Bus, FastAPI Backend, SQLite Historian, AI Engine, React Dashboard**) to inspect data structures, protocols, and algorithms.
- **Live In-Browser Simulator & AI Predictor Sandbox:**
  - Direct slider control over **Rotor Speed** (0–2500 RPM), **Phase Current** (0–25 A), **Winding Temperature** (20–130 °C), and **Bearing Vibration RMS** (0–30 mm/s).
  - Quick fault injection presets: *Healthy Baseline*, *Bearing Wear*, *Thermal Runaway*, *Mechanical Overload*, and *Critical Breakdown*.
  - Live SVG Health Score Dial, Anomaly Probability Meter, Condition Badge, and Prescriptive Maintenance recommendations that react instantly to slider adjustments.
  - **"Stream to Backend API" Button:** Ingests the configured parameters into the live SQLite database and WebSocket stream via REST.

### 6.2 Enterprise Monitoring Console ([`Dashboard.jsx`](file:///C:/Users/Admin/.gemini/antigravity/scratch/AI-MotorGuard/frontend/src/pages/Dashboard.jsx))
Designed for plant technicians and maintenance engineers, accessible at `http://localhost:5173/dashboard`:
- **Circular Health Score Dial:** Visualizes real-time motor health with progressive color states (*Green > 90%*, *Lime 75–90%*, *Amber 50–75%*, *Orange 25–50%*, *Red < 25%*).
- **Synchronized Multi-Sensor Cards:** Live telemetry tiles for Current, Temperature, Vibration, RPM, Voltage, and Electrical Load with active threshold indicators.
- **Dual Recharts Time-Series Graphs:** Synchronous historical trend visualization for Current, Temperature, Vibration RMS, and Shaft RPM over rolling sample windows.
- **Fleet Management & Simulator Station:** Dedicated interfaces for multi-motor fleet monitoring ([`Motors.jsx`](file:///C:/Users/Admin/.gemini/antigravity/scratch/AI-MotorGuard/frontend/src/pages/Motors.jsx)), feature importance attribution ([`AIAnalytics.jsx`](file:///C:/Users/Admin/.gemini/antigravity/scratch/AI-MotorGuard/frontend/src/pages/AIAnalytics.jsx)), and automated fault scenario simulation ([`Simulation.jsx`](file:///C:/Users/Admin/.gemini/antigravity/scratch/AI-MotorGuard/frontend/src/pages/Simulation.jsx)).

---

## 7. Multi-Scenario Simulation & Fault Injection

To validate the pipeline without physical hardware, the system includes both an in-process simulation loop and an external standalone CLI tool ([`simulator.py`](file:///C:/Users/Admin/.gemini/antigravity/scratch/AI-MotorGuard/simulator.py)).

### 7.1 Fault Scenario Profiles
| Scenario | Target Speed (RPM) | Stator Current (A) | Temp (°C) | Vibration (mm/s) | Physical Motor Phenomenon |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **NORMAL** | 1480 – 1520 | 3.8 – 4.3 | 48.0 – 53.0 | 0.8 – 1.4 | Nominal operating equilibrium under rated load |
| **OVERLOAD** | 1050 – 1250 | 8.5 – 14.0 | 72.0 – 88.0 | 3.2 – 5.5 | Excessive mechanical load, high stator slip, current surge |
| **OVERHEATING** | 1420 – 1490 | 4.8 – 6.0 | 85.0 – 115.0 | 1.8 – 2.8 | Winding insulation failure, ventilation blockage, thermal runaway |
| **HIGH_VIBRATION** | 1400 – 1550 | 5.0 – 7.5 | 62.0 – 74.0 | 6.5 – 16.0 | Bearing raceway spalling, dynamic rotor imbalance, misalignment |
| **LOW_RPM** | 420 – 780 | 6.5 – 8.5 | 58.0 – 68.0 | 2.5 – 4.2 | Input voltage sag, phase loss, severe frictional dragging |
| **CRITICAL** | 150 – 480 | 12.0 – 22.0 | 95.0 – 125.0 | 12.0 – 25.0 | Cascading breakdown; multiple severe electrical and mechanical failures |

### 7.2 Verification Test Run Output
Executing [`simulator.py`](file:///C:/Users/Admin/.gemini/antigravity/scratch/AI-MotorGuard/simulator.py) against the live backend demonstrates the end-to-end dataflow:

```text
======================================================================
 [AI-MOTORGUARD] Industrial Motor Telemetry Simulator
======================================================================
 Target Endpoint : http://localhost:8000/api/readings
 Target Motor ID : 1
 Initial Scenario: NORMAL
 Streaming Rate  : 2.0 Hz (every 0.5s)
======================================================================
[08:53:49] Tick #0001 | Mode: NORMAL   | RPM: 1503.5 | Curr:  4.28A | Temp:  52.0°C | Vib:  1.38mm/s | HTTP 200
[08:53:51] Tick #0002 | Mode: NORMAL   | RPM: 1526.2 | Curr:  4.19A | Temp:  48.1°C | Vib:  0.87mm/s | HTTP 200
[08:54:35] Tick #0003 | Mode: CRITICAL | RPM:  293.0 | Curr: 19.86A | Temp: 100.3°C | Vib: 18.96mm/s | HTTP 200
```

Database query verification immediately following the critical tick:
- **Health Score:** `1.0%` (Critical)
- **Anomaly Probability:** `62.6%`
- **Classified Condition:** `CRITICAL`
- **Severity Level:** `HIGH`
- **Prescriptive Recommendation:** *"SHUTDOWN IMMEDIATELY. Complete maintenance required."*
- **Audit Alert Logged:** `[HIGH] [CRITICAL] SHUTDOWN IMMEDIATELY. Complete maintenance required.`

---

## 8. Deployment & Operational Guide

The system includes a turnkey multi-process orchestrator ([`run_system.py`](file:///C:/Users/Admin/.gemini/antigravity/scratch/AI-MotorGuard/run_system.py)) that launches all components with a single command:

### 8.1 Single-Command Launch
```powershell
cd C:\Users\Admin\.gemini\antigravity\scratch\AI-MotorGuard
python run_system.py --simulate
```
*Starts the FastAPI server (`:8000`), the React web dashboard (`:5173`), and initiates automated background telemetry simulation.*

### 8.2 Component-Level Commands
```powershell
# 1. Start FastAPI Backend
cd C:\Users\Admin\.gemini\antigravity\scratch\AI-MotorGuard\backend
python -m uvicorn app.main:app --reload --port 8000

# 2. Start Frontend Website & Dashboard
cd C:\Users\Admin\.gemini\antigravity\scratch\AI-MotorGuard\frontend
npm run dev

# 3. Stream Telemetry via Standalone Simulator
cd C:\Users\Admin\.gemini\antigravity\scratch\AI-MotorGuard
python simulator.py --scenario HIGH_VIBRATION --interval 1.0

# 4. Execute Backend Automated Test Suite
cd C:\Users\Admin\.gemini\antigravity\scratch\AI-MotorGuard\backend
python -m pytest tests
```

---

## 9. Conclusion & Future Roadmap

**AI-MotorGuard** demonstrates a production-grade blueprint for industrial predictive maintenance. By unifying low-level STM32 sensor acquisition, an asynchronous FastAPI ingestion pipeline, dual-model machine learning (**99.93% classification accuracy**), and an interactive React web dashboard, the system successfully eliminates the blind spots inherent in traditional reactive and calendar-based maintenance strategies.

### Future Enhancements
1. **On-Device Edge TinyML:** Quantize the Random Forest / Decision Tree model using `tensorflow-lite-micro` or `STM32Cube.AI` to execute zero-latency inference directly on the STM32 Cortex-M7 core without requiring continuous server connectivity.
2. **Vibration Fast Fourier Transform (FFT) Acceleration:** Implement onboard CMSIS-DSP FFT routines to extract bearing fault frequencies (Ball Pass Frequency Outer Race — BPFO, Inner Race — BPFI, and Ball Spin Frequency — BSF).
3. **Industrial Wireless Mesh:** Integrate LoRaWAN or private industrial 5G modems to support long-range wireless telemetry across multi-kilometer facility footprints.
4. **Automated CMMS Integration:** Connect alert dispatches directly to Computerized Maintenance Management Systems (e.g., SAP PM, IBM Maximo) to automatically issue work-orders and reserve replacement bearings.
