# AI-MotorGuard Hardware Specification

## Component List (BOM)
- **Microcontroller:** STM32 Nucleo-H743ZI (STM32H743ZIT6)
- **Current Sensor:** ACS712 (30A version)
- **Temperature Sensor:** LM35
- **Vibration Sensor:** MPU6050 (I2C) / ADXL345
- **Motor Driver:** L298N or Industrial PWM Driver
- **Voltage Divider:** 100k / 4.7k resistors

## Wiring Guide & Pin Mapping
| Component          | STM32 Pin | Port   | Function   |
|--------------------|-----------|--------|------------|
| Current (ACS712)   | PA0       | GPIOA  | ADC1_IN16  |
| Temp (LM35)        | PA1       | GPIOA  | ADC1_IN17  |
| Voltage Div        | PA2       | GPIOA  | ADC1_IN14  |
| Motor PWM          | PA8       | GPIOA  | TIM1_CH1   |
| Motor Enable       | PA9       | GPIOA  | GPIO Out   |
| Motor Direction    | PA10      | GPIOA  | GPIO Out   |
| MPU6050 SDA        | PB9       | GPIOB  | I2C1_SDA   |
| MPU6050 SCL        | PB8       | GPIOB  | I2C1_SCL   |
| Encoder A          | PA15      | GPIOA  | TIM2_CH1   |
| FDCAN1 TX          | PD1       | GPIOD  | FDCAN1_TX  |
| FDCAN1 RX          | PD0       | GPIOD  | FDCAN1_RX  |

## Power Supply Requirements
- Nucleo Board: USB or external 7-12V (VIN)
- Motor: 12V/24V external supply
- Sensors: 3.3V/5V derived from Nucleo board rails
