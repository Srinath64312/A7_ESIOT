#ifndef __PID_CONTROLLER_H
#define __PID_CONTROLLER_H

void PID_Init(float kp, float ki, float kd);
float PID_Compute(float setpoint, float measured, float dt);

#endif /* __PID_CONTROLLER_H */
