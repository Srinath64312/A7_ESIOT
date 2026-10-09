# API Documentation

## Base Information
- **Base URL:** `http://localhost:8000/api/v1`
- **WebSocket URL:** `ws://localhost:8000/ws`
- **Authentication:** None (Development mode)

## REST Endpoints

### 1. Motors Management

#### `GET /motors`
List all monitored motors.
- **Response:**
```json
[
  {
    "id": 1,
    "name": "Main Conveyor Motor",
    "location": "Line A",
    "status": "active",
    "created_at": "2023-10-01T12:00:00Z"
  }
]
```

#### `POST /motors`
Register a new motor.
- **Request Body:**
```json
{
  "name": "Cooling Fan Motor",
  "location": "HVAC Room 2"
}
```
- **Response:** `201 Created` with motor object.

#### `GET /motors/{id}`
Get specific motor details.

### 2. Telemetry

#### `GET /telemetry/{motor_id}`
Get historical telemetry data. Accepts query params `limit` and `offset`.

#### `POST /telemetry/ingest`
Ingest new sensor readings from the hardware/gateway.
- **Request Body:**
```json
{
  "motor_id": 1,
  "temperature": 45.5,
  "vibration_x": 0.02,
  "vibration_y": 0.05,
  "vibration_z": 0.01,
  "current": 5.2,
  "rpm": 1450,
  "timestamp": "2023-10-05T10:00:00Z"
}
```
- **Response:** `201 Created`

### 3. AI Predictions

#### `GET /ai/predictions/{motor_id}`
Get historical AI predictions for a motor.

### 4. Alerts

#### `GET /alerts`
List active (unresolved) alerts.
- **Response:**
```json
[
  {
    "id": 102,
    "motor_id": 1,
    "alert_type": "temperature_high",
    "severity": "critical",
    "message": "Overheating detected (Temp: 85C)",
    "resolved": false
  }
]
```

#### `PUT /alerts/{id}/resolve`
Mark an alert as resolved.

### 5. Simulation Control

#### `POST /simulation/start`
Start the background simulation engine.

#### `POST /simulation/stop`
Stop the simulation engine.

#### `POST /simulation/scenario`
Inject a specific failure scenario.
- **Request Body:**
```json
{
  "scenario": "stator_short",
  "intensity": 0.8
}
```

---

## WebSocket Protocol

Clients can connect to WebSockets to receive real-time, low-latency updates.

### Connection
Connect to: `ws://localhost:8000/ws/dashboard`

### Message Types

All messages from the server are JSON formatted with an `event` field indicating the message type.

#### 1. Telemetry Update
Triggered on every new sensor reading.
```json
{
  "event": "telemetry_update",
  "data": {
    "motor_id": 1,
    "temperature": 45.5,
    "current": 5.2,
    "rpm": 1450,
    "timestamp": "2023-10-05T10:00:00Z"
  }
}
```

#### 2. Prediction Update
Triggered after the AI engine processes a reading.
```json
{
  "event": "prediction_update",
  "data": {
    "motor_id": 1,
    "is_anomaly": true,
    "anomaly_score": 0.85,
    "predicted_condition": "bearing_imbalance",
    "health_score": 42.5
  }
}
```

#### 3. Alert Update
Triggered when a new alert is generated.
```json
{
  "event": "alert_update",
  "data": {
    "alert_id": 105,
    "severity": "high",
    "message": "Bearing imbalance predicted with high confidence."
  }
}
```
