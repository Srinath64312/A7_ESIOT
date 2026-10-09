#include "pid_controller.h"

static float _kp = 0.0f;
static float _ki = 0.0f;
static float _kd = 0.0f;

static float _integral = 0.0f;
static float _prev_error = 0.0f;

void PID_Init(float kp, float ki, float kd) {
    _kp = kp;
    _ki = ki;
    _kd = kd;
    _integral = 0.0f;
    _prev_error = 0.0f;
}

float PID_Compute(float setpoint, float measured, float dt) {
    float error = setpoint - measured;
    
    _integral += error * dt;
    // Anti-windup
    if (_integral > 1000.0f) _integral = 1000.0f;
    if (_integral < -1000.0f) _integral = -1000.0f;
    
    float derivative = (error - _prev_error) / dt;
    _prev_error = error;
    
    float output = (_kp * error) + (_ki * _integral) + (_kd * derivative);
    
    if (output > 100.0f) output = 100.0f;
    if (output < 0.0f) output = 0.0f;
    
    return output;
}
