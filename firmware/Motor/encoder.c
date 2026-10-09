#include "encoder.h"

static volatile uint32_t last_capture = 0;
static volatile uint32_t current_capture = 0;
static volatile uint32_t pulse_period = 0;
static volatile uint32_t rpm = 0;

void Encoder_Init(void) {
    // Stub: HAL_TIM_IC_Start_IT(&htim2, TIM_CHANNEL_1);
}

// Call from TIM IC Callback
void Encoder_CaptureCallback(uint32_t capture) {
    current_capture = capture;
    if (current_capture >= last_capture) {
        pulse_period = current_capture - last_capture;
    } else {
        pulse_period = (0xFFFFFFFF - last_capture) + current_capture;
    }
    last_capture = current_capture;
    
    if (pulse_period > 0) {
        // e.g. timer clk 1MHz, 1 pulse per rev
        rpm = (60000000 / pulse_period);
    }
}

uint32_t Encoder_GetRPM(void) {
    // Basic timeout for zero RPM logic
    return rpm;
}
