#ifndef INPUT_H
#define INPUT_H

#include "driver/gpio.h"

typedef struct{
    gpio_num_t pin;
    gpio_mode_t mode;
    gpio_pullup_t pull_up_en;
    gpio_pulldown_t pull_down_en;
    gpio_int_type_t intr_type;
    uint32_t debounce_ms;
} input_config_t;

typedef void (*input_callback_t)(int);

void input_init(const input_config_t *input_config);
void input_create_button(gpio_num_t gpio_num);
void input_create_sensor(gpio_num_t gpio_num);
void input_set_callback(void *cb);
void input_create_touch(gpio_num_t gpio_num);

#endif