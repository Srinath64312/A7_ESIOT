# Testing Documentation

This document outlines the testing strategy, categories, and execution procedures for the AI-MotorGuard system.

## Test Strategy

The project follows a standard testing pyramid:
1. **Unit Tests:** Verify individual functions (AI inference logic, health score calculation, data validation).
2. **Integration Tests:** Verify interactions between components (API to Database, API to AI Engine).
3. **End-to-End (E2E) Tests:** Verify the complete flow from telemetry ingestion via WebSocket/HTTP to database storage and dashboard update.

## Test Categories

| Category | Description | Tools Used |
|----------|-------------|------------|
| **Backend Unit** | FastAPI endpoint logic, Pydantic schemas, ML pipeline functions. | `pytest`, `unittest.mock` |
| **Database** | CRUD operations, SQLAlchemy models, Alembic migrations. | `pytest`, SQLite in-memory DB |
| **AI/ML** | Model loading, inference time constraints, output validity. | `pytest`, `numpy.testing` |
| **Frontend** | React components, state management, charting rendering. | `Jest`, `React Testing Library` |
| **Hardware** | Embedded C unit testing for FreeRTOS tasks and math filters. | `Unity`, `CMock` |

## Running Tests

### Backend Testing (Python/FastAPI)
Navigate to the `backend` directory:
```bash
# Run all tests
pytest

# Run tests with coverage report
pytest --cov=app --cov-report=term-missing tests/

# Run specific test file
pytest tests/test_ai_engine.py
```

### Frontend Testing (React)
Navigate to the `frontend` directory:
```bash
npm run test
```

## Coverage Targets
- **Backend Core Logic (AI/Scoring):** 90%+
- **API Endpoints:** 85%+
- **Frontend Components:** 70%+

## Key Test Scenarios

| Scenario | Expected Behavior | Status |
|----------|-------------------|--------|
| Ingest normal telemetry | DB updated, Prediction normal, Health > 90% | ✅ Implemented |
| Ingest catastrophic data | DB updated, Alert generated, Health < 30% | ✅ Implemented |
| Missing sensor field in payload | 422 Unprocessable Entity error | ✅ Implemented |
| WS client connection | Connection accepted, heartbeat maintained | ✅ Implemented |
| ML model inference time | Inference completes in < 50ms | ✅ Implemented |
| Simulate Stator Short | RF predicts 'stator_short', Severity High | ⏳ Pending |
| Resolve Alert | Alert marked resolved, UI updated via WS | ✅ Implemented |
