#include "main.h"
#include "sensor_manager.h"
#include "motor_manager.h"
#include "uart_telemetry.h"
#include "can_protocol.h"
#include "fault_detector.h"
#include "safety_manager.h"

void SystemClock_Config(void);
static void MX_GPIO_Init(void);

int main(void) {
    HAL_Init();
    SystemClock_Config();
    MX_GPIO_Init();
    
    SensorManager_Init();
    MotorManager_Init();
    UART_Telemetry_Init();
    CAN_Protocol_Init();
    SafetyManager_Init();
    
    uint32_t last_telemetry_time = 0;
    uint32_t last_fault_check_time = 0;

    while (1) {
        uint32_t now = HAL_GetTick();
        
        if (now - last_fault_check_time >= FAULT_CHECK_INTERVAL_MS) {
            last_fault_check_time = now;
            SensorManager_Update();
            FaultDetector_Check();
            SafetyManager_Process();
            MotorManager_Process();
        }
        
        if (now - last_telemetry_time >= TELEMETRY_INTERVAL_MS) {
            last_telemetry_time = now;
            UART_Telemetry_Send();
            CAN_Protocol_SendHeartbeat();
            CAN_Protocol_SendTelemetry();
        }
    }
}

void SystemClock_Config(void) {
    // Basic clock config stub for H743
}

static void MX_GPIO_Init(void) {
    __HAL_RCC_GPIOA_CLK_ENABLE();
    __HAL_RCC_GPIOB_CLK_ENABLE();
    __HAL_RCC_GPIOC_CLK_ENABLE();
}

void Error_Handler(void) {
    __disable_irq();
    while (1) {}
}
