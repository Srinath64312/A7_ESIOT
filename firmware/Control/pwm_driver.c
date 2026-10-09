#include "pwm_driver.h"
#include "main.h"

void PWM_Driver_Init(void) {
    // Stub: HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_1);
}

void PWM_Driver_SetDuty(uint16_t duty_percent) {
    if (duty_percent > 100) duty_percent = 100;
    
    // e.g. period = 1000
    // __HAL_TIM_SET_COMPARE(&htim1, TIM_CHANNEL_1, duty_percent * 10);
}
