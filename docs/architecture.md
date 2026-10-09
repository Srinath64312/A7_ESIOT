# System Architecture

This document details the architectural design of the AI-MotorGuard system.

## 1. Overall System Architecture

The system is designed as a distributed IoT application with clear boundaries between the edge sensing layer, the processing backend, and the presentation frontend.

```mermaid
flowchart TD
    %% Edge Layer
    subgraph Edge[Edge Hardware Layer]
        Sensors[Sensors: Temp, Vib, Curr, RPM]
        MCU[STM32 Microcontroller]
        Sensors -->|Analog/I2C/SPI| MCU
    end

    %% Gateway Layer
    subgraph Gateway[Edge Gateway Layer]
        Bridge[Serial/CAN Bridge]
        MCU -->|UART/CAN| Bridge
    end

    %% Backend Layer
    subgraph Backend[Backend Services Layer]
        API[FastAPI REST API]
        WS[WebSocket Server]
        Bridge -->|HTTP POST| API
        
        subgraph ML[AI & Analytics Engine]
            PreProc[Data Preprocessor]
            IF[Isolation Forest]
            RF[Random Forest]
            Health[Health Score Engine]
        end
        
        API --> PreProc
        PreProc --> IF
        PreProc --> RF
        IF --> Health
        RF --> Health
        Health --> API
    end

    %% Persistence Layer
    subgraph Persistence[Data Layer]
        DB[(PostgreSQL Database)]
        API <-->|SQLAlchemy ORM| DB
    end

    %% Frontend Layer
    subgraph Frontend[User Interface Layer]
        Dashboard[React Web Application]
        API -->|HTTP GET/POST| Dashboard
        WS -->|Real-time Data| Dashboard
    end
    
    API -.-> WS
```

## 2. Data Flow Architecture

The following diagram illustrates how raw sensor data is transformed into actionable maintenance insights.

```mermaid
flowchart LR
    A["Raw Sensor Signals"] --> B["STM32 ADC/I2C"]
    B --> C["Digital Filtering & Scaling"]
    C --> D["JSON Payload Generation"]
    D --> E["API Ingestion Endpoint"]
    E --> F["Database Storage"]
    E --> G["Feature Engineering"]
    G --> H{"AI Inference"}
    H -->|Anomaly Score| I["Isolation Forest"]
    H -->|Fault Class| J["Random Forest"]
    I --> K["Health Score Calculation"]
    J --> K
    K --> L["WebSocket Broadcast"]
    L --> M["UI Dashboard Update"]
```

## 3. Component Interaction Sequence

This sequence diagram details the real-time synchronous and asynchronous interactions from the moment a reading is taken to when it appears on the dashboard.

```mermaid
sequenceDiagram
    participant S as Sensors
    participant MCU as STM32 Firmware
    participant GW as Gateway Script
    participant API as FastAPI Backend
    participant ML as AI Engine
    participant DB as PostgreSQL
    participant UI as React Frontend

    S->>MCU: Physical Signals
    activate MCU
    MCU->>MCU: Signal Conditioning
    MCU->>GW: Serial Frame (Binary/ASCII)
    deactivate MCU
    
    activate GW
    GW->>API: POST /api/v1/telemetry/ingest
    deactivate GW
    
    activate API
    API->>DB: INSERT Reading
    API->>ML: Pass structured reading
    activate ML
    ML->>ML: Extract Features
    ML->>ML: IF Predict (Anomaly)
    ML->>ML: RF Predict (Condition)
    ML->>ML: Calculate Health Score
    ML-->>API: Inference Results
    deactivate ML
    
    API->>DB: INSERT AI_Prediction
    
    par Async Broadcast
        API->>UI: WS: telemetry_update
        API->>UI: WS: prediction_update
        alt is_anomaly == true
            API->>DB: INSERT Alert
            API->>UI: WS: alert_update
        end
    end
    
    API-->>GW: 201 Created
    deactivate API
```

## 4. Deployment Architecture

The deployment is containerized using Docker, allowing for reproducible and scalable installations.

```mermaid
flowchart TD
    subgraph Host OS (Linux/Windows)
        
        subgraph Docker Compose Network
            UI_Cont["Frontend Container\n(Nginx + React)"]
            API_Cont["Backend Container\n(Uvicorn + FastAPI)"]
            DB_Cont["Database Container\n(PostgreSQL)"]
        end
        
        GatewayApp["Python Gateway Process\n(Running on Host)"]
        
        GatewayApp -->|Port 8000| API_Cont
        UI_Cont -->|Port 8000| API_Cont
        API_Cont <-->|Port 5432| DB_Cont
    end
    
    STM32["STM32 Hardware"] -->|USB/COM| GatewayApp
    User["Web Browser"] -->|Port 80| UI_Cont
```
