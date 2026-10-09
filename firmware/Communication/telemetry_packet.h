#ifndef __TELEMETRY_PACKET_H
#define __TELEMETRY_PACKET_H

#include <stdint.h>

typedef struct {
    uint32_t timestamp;
    uint32_t rpm;
    float current;
    float temperature;
    float vibration;
    float voltage;
    uint8_t load;
    uint8_t pwm_duty;
    uint8_t fault_status;
    uint8_t crc;
} TelemetryPacket_t;

uint8_t CalculateCRC(uint8_t* data, uint16_t len);

#endif /* __TELEMETRY_PACKET_H */
