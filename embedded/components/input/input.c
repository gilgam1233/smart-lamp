#include "input.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/timers.h"
#include <stdio.h>

static input_callback_t input_callback = NULL;

static TimerHandle_t debounce_timers[GPIO_NUM_MAX] = {NULL};

void input_set_callback(void *cb)
{
    input_callback = (input_callback_t)cb;
}

static void debounce_timer_callback(TimerHandle_t xTimer)
{
    uint32_t gpio_num = (uint32_t)pvTimerGetTimerID(xTimer);

   if (gpio_get_level(gpio_num) == 0) 
    {
        if (input_callback != NULL)
        {
            input_callback(gpio_num);
        }
    }

    gpio_intr_enable(gpio_num);
}

static void IRAM_ATTR gpio_input_handler(void *arg)
{
    uint32_t gpio_num = (uint32_t)arg;

    gpio_intr_disable(gpio_num);

    BaseType_t xHigherPriorityTaskWoken = pdFALSE;
    xTimerStartFromISR(debounce_timers[gpio_num], &xHigherPriorityTaskWoken);

    if (xHigherPriorityTaskWoken)
    {
        portYIELD_FROM_ISR();
    }
}

void input_init(const input_config_t *input_config)
{
    gpio_config_t io_conf = {0};

    io_conf.pin_bit_mask = (1ULL << input_config->pin);
    io_conf.mode = input_config->mode;
    io_conf.intr_type = input_config->intr_type;
    io_conf.pull_down_en = input_config->pull_down_en;
    io_conf.pull_up_en = input_config->pull_up_en;

    gpio_config(&io_conf);

    if (input_config->debounce_ms > 0)
    {
        if (debounce_timers[input_config->pin] == NULL)
        {
            debounce_timers[input_config->pin] = xTimerCreate(
                "deb_tmr",
                pdMS_TO_TICKS(input_config->debounce_ms),
                pdFALSE,
                (void *)input_config->pin,
                debounce_timer_callback);
        }
    }

    if (input_config->intr_type != GPIO_INTR_DISABLE)
    {
        gpio_install_isr_service(0);
        gpio_isr_handler_add(input_config->pin, gpio_input_handler, (void *)input_config->pin);
    }
}

void input_create_button(gpio_num_t gpio_num)
{
    input_config_t config = {
        .pin = gpio_num,
        .mode = GPIO_MODE_INPUT,
        .pull_up_en = 1,
        .pull_down_en = 0,
        .intr_type = GPIO_INTR_NEGEDGE,
        .debounce_ms = 250};

    input_init(&config);
}

void input_create_sensor(gpio_num_t gpio_num)
{
    input_config_t config = {
        .pin = gpio_num,
        .mode = GPIO_MODE_INPUT,
        .pull_up_en = 0,
        .pull_down_en = 0,
        .intr_type = GPIO_INTR_DISABLE,
        .debounce_ms = 0

    };

    input_init(&config);
}

void input_create_touch(gpio_num_t gpio_num)
{
    input_config_t config = {
        .pin = gpio_num,
        .intr_type = GPIO_INTR_NEGEDGE,
        .mode = GPIO_MODE_INPUT,
        .pull_up_en=1,
        .pull_down_en=0,
        .debounce_ms=250
    };

    input_init(&config);
}
