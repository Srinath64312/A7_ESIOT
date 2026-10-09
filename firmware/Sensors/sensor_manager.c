#include "sensor_manager.h"
#include "adc_sensors.h"
#include "vibration.h"
#include "../Motor/encoder.h"

static SensorData_t sensor_data;

void SensorManager_Init(void) {
    ADC_Sensors_Init();
    Vibration_Init();
    Encoder_Init();
    sensor_data.sensor_fault = false;
}

void SensorManager_Update(void) {
    ADC_Sensors_Update();
    Vibration_Update();
    
    sensor_data.current = ADC_GetCurrent();
    sensor_data.temperature = ADC_GetTemperature();
    sensor_data.voltage = ADC_GetVoltage();
    sensor_data.vibration_rms = Vibration_GetRMS();
    sensor_data.rpm = Encoder_GetRPM();
    
    // Validate readings
    sensor_data.sensor_fault = false;
    if (sensor_data.voltage < 0.0f || sensor_data.temperature < -40.0f || sensor_data.temperature > 150.0f) {
        sensor_data.sensor_fault = true;
    }
}

SensorData_t* SensorManager_GetData(void) {
    return &sensor_data;
}
