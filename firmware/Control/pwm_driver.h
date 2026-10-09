#ifndef __PWM_DRIVER_H
#define __PWM_DRIVER_H

#include <stdint.h>

void PWM_Driver_Init(void);
void PWM_Driver_SetDuty(uint16_t duty_percent);

#endif /* __PWM_DRIVER_H */
