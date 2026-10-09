#ifndef __MOTOR_MANAGER_H
#define __MOTOR_MANAGER_H

#include "main.h"

typedef enum {
    MOTOR_IDLE,
    MOTOR_RUNNING,
    MOTOR_FAULT,
    MOTOR_SAFE_STOP
} MotorState_t;

void MotorManager_Init(void);
void MotorManager_Process(void);
void MotorManager_SetState(MotorState_t state);
MotorState_t MotorManager_GetState(void);

#endif /* __MOTOR_MANAGER_H */
