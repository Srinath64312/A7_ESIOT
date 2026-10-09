#include "uart_telemetry.h"
#include "../Sensors/sensor_manager.h"
#include <stdio.h>
#include <string.h>

static char tx_buffer[256];

void UART_Telemetry_Init(void) {
    // Stub: HAL_UART_Init(&huart2);
}

void UART_Telemetry_Send(void) {
    SensorData_t* data = SensorManager_GetData();
    
    // {"ts":123,"id":1,"rpm":1500,"cur":4.2,"tmp":55,"vib":1.2,"vlt":230,"ld":45,"pwm":50,"flt":0}
    int len = snprintf(tx_buffer, sizeof(tx_buffer), 
        "{\"ts\":%lu,\"id\":1,\"rpm\":%lu,\"cur\":%.2f,\"tmp\":%.1f,\"vib\":%.2f,\"vlt\":%.1f,\"ld\":%u,\"pwm\":50,\"flt\":%d}\r\n",
        HAL_GetTick(),
        data->rpm,
        data->current,
        data->temperature,
        data->vibration_rms,
        data->voltage,
        data->load,
        data->sensor_fault ? 1 : 0
    );
    
    if (len > 0) {
        // HAL_UART_Transmit_DMA(&huart2, (uint8_t*)tx_buffer, len);
    }
}
