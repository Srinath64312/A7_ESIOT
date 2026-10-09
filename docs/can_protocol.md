# AI-MotorGuard CAN Protocol Specification

## Message Definitions

| Message ID | Message Type       | DLC | Direction | Update Period |
|------------|--------------------|-----|-----------|---------------|
| `0x001`    | Heartbeat          | 2   | TX        | 1000 ms       |
| `0x101`    | Motor Telemetry    | 8   | TX        | 100 ms        |
| `0x102`    | Extended Telemetry | 8   | TX        | 100 ms        |
| `0x201`    | Motor Command      | 4   | RX        | Async         |
| `0x301`    | Fault Status       | 4   | TX        | On change     |
| `0x401`    | Health Info        | 4   | TX        | 1000 ms       |

## Payload Layouts

### 0x001 Heartbeat
- **Byte 0:** Counter (0-255, wraps)
- **Byte 1:** Status (0=Init, 1=OK, 2=Fault)

### 0x101 Motor Telemetry
- **Byte 0-1:** RPM (16-bit uint, 1 RPM/bit)
- **Byte 2-3:** Current (16-bit uint, 0.01 A/bit)
- **Byte 4:** Temperature (8-bit uint, 1 °C/bit)
- **Byte 5:** Vibration RMS (8-bit uint, 0.1 g/bit)
- **Byte 6:** Voltage (8-bit uint, 1 V/bit)
- **Byte 7:** Load % (8-bit uint, 1 %/bit)

### 0x201 Motor Command
- **Byte 0:** Command Type (1=Start, 2=Stop, 3=SetSpeed)
- **Byte 1-2:** Target RPM (16-bit uint)
- **Byte 3:** PWM Duty (0-100%)

### 0x301 Fault Status
- **Byte 0-1:** Fault Code (Bitmask: 1=OC, 2=OT, 4=OS)
- **Byte 2:** Severity (1=Warn, 2=Critical)
- **Byte 3:** Action (1=Log, 2=Stop)
