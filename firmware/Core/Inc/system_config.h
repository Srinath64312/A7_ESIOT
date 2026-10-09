#ifndef __SYSTEM_CONFIG_H
#define __SYSTEM_CONFIG_H

#define TELEMETRY_INTERVAL_MS 100
#define FAULT_CHECK_INTERVAL_MS 10

/* Fault Thresholds */
#define MAX_CURRENT_A        10.0f
#define MAX_TEMP_C           90.0f
#define MAX_RPM              2000
#define MIN_RUNNING_RPM      200

/* Pins */
#define CURRENT_SENSOR_PIN   GPIO_PIN_0
#define CURRENT_SENSOR_PORT  GPIOA
#define TEMP_SENSOR_PIN      GPIO_PIN_1
#define TEMP_SENSOR_PORT     GPIOA
#define VOLTAGE_SENSOR_PIN   GPIO_PIN_2
#define VOLTAGE_SENSOR_PORT  GPIOA

#define PWM_OUT_PIN          GPIO_PIN_8
#define PWM_OUT_PORT         GPIOA
#define MOTOR_EN_PIN         GPIO_PIN_9
#define MOTOR_EN_PORT        GPIOA
#define MOTOR_DIR_PIN        GPIO_PIN_10
#define MOTOR_DIR_PORT       GPIOA

#endif /* __SYSTEM_CONFIG_H */
