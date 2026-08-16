#ifndef OUTPUT_H
#define OUTPUT_H

#include "driver/gpio.h"

void create_output(gpio_num_t gpio_num);
void set_level_output(gpio_num_t gpio_num,uint32_t num);
void toggle_level_output(gpio_num_t gpio_num);


#endif