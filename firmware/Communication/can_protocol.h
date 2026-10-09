#ifndef __CAN_PROTOCOL_H
#define __CAN_PROTOCOL_H

#include "main.h"

void CAN_Protocol_Init(void);
void CAN_Protocol_SendHeartbeat(void);
void CAN_Protocol_SendTelemetry(void);

#endif /* __CAN_PROTOCOL_H */
