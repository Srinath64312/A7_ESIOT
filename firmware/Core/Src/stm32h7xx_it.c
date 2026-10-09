#include "main.h"
#include "stm32h7xx_it.h"

extern void HAL_IncTick(void);

void SysTick_Handler(void) {
    HAL_IncTick();
}

void NMI_Handler(void) {}
void HardFault_Handler(void) { while (1) {} }
void MemManage_Handler(void) { while (1) {} }
void BusFault_Handler(void) { while (1) {} }
void UsageFault_Handler(void) { while (1) {} }
void SVC_Handler(void) {}
void DebugMon_Handler(void) {}
void PendSV_Handler(void) {}

void TIM1_UP_IRQHandler(void) {
    // HAL_TIM_IRQHandler(&htim1);
}

void USART2_IRQHandler(void) {
    // HAL_UART_IRQHandler(&huart2);
}

void FDCAN1_IT0_IRQHandler(void) {
    // HAL_FDCAN_IRQHandler(&hfdcan1);
}

void FDCAN1_IT1_IRQHandler(void) {
    // HAL_FDCAN_IRQHandler(&hfdcan1);
}

void DMA1_Stream0_IRQHandler(void) {
    // HAL_DMA_IRQHandler(&hdma_adc1);
}
