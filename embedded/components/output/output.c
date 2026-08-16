#include "output.h"
#include <stdio.h>

void create_output(gpio_num_t gpio_num)
{
    gpio_reset_pin(gpio_num);
    gpio_set_direction(gpio_num,GPIO_MODE_INPUT_OUTPUT);
}
void set_level_output(gpio_num_t gpio_num,uint32_t num)
{
    gpio_set_level(gpio_num,num);
}
void toggle_level_output(gpio_num_t gpio_num)
{
    uint32_t current_level = gpio_get_level(gpio_num);

    set_level_output(gpio_num,!current_level);
}


