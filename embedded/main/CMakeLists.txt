set(my_requirements 
    driver 
    esp_driver_gpio 
    input 
    output
    wifi 
    mqtt 
    esp_wifi 
    nvs_flash
    cjson
)

idf_component_register(SRCS "app_main.c"
                       INCLUDE_DIRS "."
                       REQUIRES ${my_requirements})