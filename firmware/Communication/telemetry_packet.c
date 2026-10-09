#include "telemetry_packet.h"

uint8_t CalculateCRC(uint8_t* data, uint16_t len) {
    uint8_t crc = 0;
    for (uint16_t i = 0; i < len; i++) {
        crc ^= data[i];
    }
    return crc;
}
