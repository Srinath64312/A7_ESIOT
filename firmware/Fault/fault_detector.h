#ifndef __FAULT_DETECTOR_H
#define __FAULT_DETECTOR_H

#include <stdint.h>
#include <stdbool.h>

#define FAULT_NONE          0x00
#define FAULT_OVERCURRENT   0x01
#define FAULT_OVERTEMP      0x02
#define FAULT_OVERSPEED     0x04
#define FAULT_UNDERSPEED    0x08
#define FAULT_SENSOR_FAIL   0x10

void FaultDetector_Check(void);
uint16_t FaultDetector_GetStatus(void);
bool FaultDetector_HasFault(void);

#endif /* __FAULT_DETECTOR_H */
