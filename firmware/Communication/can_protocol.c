#include "can_protocol.h"
#include "../Sensors/sensor_manager.h"

static uint8_t hb_counter = 0;

void CAN_Protocol_Init(void) {
    // Stub: HAL_FDCAN_Start(&hfdcan1);
}

void CAN_Protocol_SendHeartbeat(void) {
    uint8_t payload[2];
    payload[0] = hb_counter++;
    payload[1] = 0x01; // Status OK
    // HAL_FDCAN_AddMessageToTxFifoQ(&hfdcan1, &TxHeader, payload);
}

void CAN_Protocol_SendTelemetry(void) {
    SensorData_t* data = SensorManager_GetData();
    uint8_t payload[8];
    
    payload[0] = (data->rpm >> 8) & 0xFF;
    payload[1] = data->rpm & 0xFF;
    
    uint16_t cur_scaled = (uint16_t)(data->current * 100);
    payload[2] = (cur_scaled >> 8) & 0xFF;
    payload[3] = cur_scaled & 0xFF;
    
    payload[4] = (uint8_t)data->temperature;
    payload[5] = (uint8_t)(data->vibration_rms * 10);
    payload[6] = (uint8_t)data->voltage;
    payload[7] = data->load;
    
    // HAL_FDCAN_AddMessageToTxFifoQ(&hfdcan1, &TxHeader, payload);
}
