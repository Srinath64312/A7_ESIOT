#ifndef __ADC_SENSORS_H
#define __ADC_SENSORS_H

#include "main.h"

#define ADC_CHANNELS 3
#define ADC_VREF     3.3f
#define ADC_MAX_VAL  65535.0f // 16-bit ADC on H7

void ADC_Sensors_Init(void);
void ADC_Sensors_Update(void);
float ADC_GetCurrent(void);
float ADC_GetTemperature(void);
float ADC_GetVoltage(void);

#endif /* __ADC_SENSORS_H */
