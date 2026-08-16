idf_component_register(SRCS "wifi.c"
                    INCLUDE_DIRS "."
                    REQUIRES 
                    driver 
                    esp_driver_gpio
                    mqtt 
                    esp_wifi 
                    nvs_flash
                    cjson)