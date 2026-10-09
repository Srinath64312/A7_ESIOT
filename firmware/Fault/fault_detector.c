#include "fault_detector.h"
#include "../Sensors/sensor_manager.h"
#include "../Motor/motor_manager.h"

static uint16_t fault_status = FAULT_NONE;

void FaultDetector_Check(void) {
    SensorData_t* data = SensorManager_GetData();
    fault_status = FAULT_NONE;
    
    if (data->sensor_fault) {
        fault_status |= FAULT_SENSOR_FAIL;
    }
    if (data->current > MAX_CURRENT_A) {
        fault_status |= FAULT_OVERCURRENT;
    }
    if (data->temperature > MAX_TEMP_C) {
        fault_status |= FAULT_OVERTEMP;
    }
    if (data->rpm > MAX_RPM) {
        fault_status |= FAULT_OVERSPEED;
    }
    
    if (MotorManager_GetState() == MOTOR_RUNNING && data->rpm < MIN_RUNNING_RPM) {
        // Simple underspeed check
        // fault_status |= FAULT_UNDERSPEED; 
    }
}

uint16_t FaultDetector_GetStatus(void) {
    return fault_status;
}

bool FaultDetector_HasFault(void) {
    return fault_status != FAULT_NONE;
}
