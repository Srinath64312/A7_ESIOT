#include "safety_manager.h"
#include "fault_detector.h"
#include "../Motor/motor_manager.h"

void SafetyManager_Init(void) {
    // Initialization
}

void SafetyManager_Process(void) {
    if (FaultDetector_HasFault()) {
        MotorManager_SetState(MOTOR_FAULT);
    }
}
