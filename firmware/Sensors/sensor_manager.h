#ifndef __SENSOR_MANAGER_H
#define __SENSOR_MANAGER_H

#include "main.h"
#include <stdint.h>
#include <stdbool.h>

typedef struct {
    float current;
    float temperature;
    float voltage;
    float vibration_rms;
    uint32_t rpm;
    uint8_t load;
    bool sensor_fault;
} SensorData_t;

void SensorManager_Init(void);
void SensorManager_Update(void);
SensorData_t* SensorManager_GetData(void);

#endif /* __SENSOR_MANAGER_H */
