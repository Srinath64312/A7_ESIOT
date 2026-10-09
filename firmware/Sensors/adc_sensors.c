#include "adc_sensors.h"

static volatile uint16_t adc_buffer[ADC_CHANNELS];
static float current_a = 0.0f;
static float temp_c = 0.0f;
static float voltage_v = 0.0f;

void ADC_Sensors_Init(void) {
    // Stub: HAL_ADC_Start_DMA(&hadc1, (uint32_t*)adc_buffer, ADC_CHANNELS);
}

void ADC_Sensors_Update(void) {
    // Scale ADC values
    float cur_v = (adc_buffer[0] / ADC_MAX_VAL) * ADC_VREF;
    float tmp_v = (adc_buffer[1] / ADC_MAX_VAL) * ADC_VREF;
    float vlt_v = (adc_buffer[2] / ADC_MAX_VAL) * ADC_VREF;
    
    // ACS712: 185mV/A, VCC/2 offset
    current_a = (cur_v - 1.65f) / 0.185f;
    if(current_a < 0) current_a = -current_a;
    
    // LM35: 10mV/degC
    temp_c = tmp_v / 0.01f;
    
    // Voltage divider: e.g. 100k / 4.7k
    voltage_v = vlt_v * (104.7f / 4.7f);
}

float ADC_GetCurrent(void) { return current_a; }
float ADC_GetTemperature(void) { return temp_c; }
float ADC_GetVoltage(void) { return voltage_v; }
