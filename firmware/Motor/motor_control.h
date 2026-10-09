#ifndef __MOTOR_CONTROL_H
#define __MOTOR_CONTROL_H

#include "main.h"

void Motor_Init(void);
void Motor_Enable(void);
void Motor_Disable(void);
void Motor_SetDirection(uint8_t forward);
void Motor_SetPWM(uint16_t duty);

#endif /* __MOTOR_CONTROL_H */
