#include "motor_control.h"
#include "../Control/pwm_driver.h"

void Motor_Init(void) {
    PWM_Driver_Init();
    Motor_Disable();
}

void Motor_Enable(void) {
    HAL_GPIO_WritePin(MOTOR_EN_PORT, MOTOR_EN_PIN, GPIO_PIN_SET);
}

void Motor_Disable(void) {
    HAL_GPIO_WritePin(MOTOR_EN_PORT, MOTOR_EN_PIN, GPIO_PIN_RESET);
    PWM_Driver_SetDuty(0);
}

void Motor_SetDirection(uint8_t forward) {
    if (forward) {
        HAL_GPIO_WritePin(MOTOR_DIR_PORT, MOTOR_DIR_PIN, GPIO_PIN_SET);
    } else {
        HAL_GPIO_WritePin(MOTOR_DIR_PORT, MOTOR_DIR_PIN, GPIO_PIN_RESET);
    }
}

void Motor_SetPWM(uint16_t duty) {
    PWM_Driver_SetDuty(duty);
}
