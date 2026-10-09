#include "motor_manager.h"
#include "motor_control.h"

static MotorState_t current_state = MOTOR_IDLE;

void MotorManager_Init(void) {
    Motor_Init();
    current_state = MOTOR_IDLE;
}

void MotorManager_Process(void) {
    switch (current_state) {
        case MOTOR_IDLE:
            Motor_Disable();
            break;
        case MOTOR_RUNNING:
            Motor_Enable();
            // Control logic goes here (PID update)
            break;
        case MOTOR_FAULT:
            Motor_Disable();
            break;
        case MOTOR_SAFE_STOP:
            Motor_SetPWM(0); // Gradual stop or immediate
            Motor_Disable();
            break;
    }
}

void MotorManager_SetState(MotorState_t state) {
    current_state = state;
}

MotorState_t MotorManager_GetState(void) {
    return current_state;
}
