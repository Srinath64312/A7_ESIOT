#include "vibration.h"
#include <math.h>

static float vibration_rms = 0.0f;

void Vibration_Init(void) {
    // Stub: Initialize I2C and MPU6050/ADXL345
}

void Vibration_Update(void) {
    // Read registers via I2C (Stub)
    int16_t ax = 0; // HAL_I2C_Mem_Read(...)
    int16_t ay = 0;
    int16_t az = 0;
    
    float x = ax / 16384.0f;
    float y = ay / 16384.0f;
    float z = az / 16384.0f;
    
    vibration_rms = sqrtf(x*x + y*y + z*z);
}

float Vibration_GetRMS(void) {
    return vibration_rms;
}
