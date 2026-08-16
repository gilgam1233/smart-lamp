#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "driver/gpio.h"
#include "esp_log.h"
#include "esp_system.h"
#include "esp_event.h"
#include "esp_netif.h"
#include "nvs_flash.h"
#include "mqtt_client.h"
#include "cJSON.h"
#include "esp_mac.h"


// --- THƯ VIỆN CỦA BẠN ---
#include "input.h"
#include "output.h"
#include "wifi.h"
#include "secrets.h"

// --- CẤU HÌNH PHẦN CỨNG ---
#define BUTTON_PIN GPIO_NUM_18
#define LED_PIN GPIO_NUM_19
#define SENSOR_PIN GPIO_NUM_21
#define TOUCH_PIN GPIO_NUM_23

// --- CẤU HÌNH MẠNG & MQTT ---

static const char *TAG = "SMART_LAMP";

// --- BIẾN TOÀN CỤC ---
static QueueHandle_t gpio_evt_queue = NULL;
esp_mqtt_client_handle_t mqtt_client = NULL;
char TOPIC_CMD[64];
char TOPIC_STATUS[64];
char DEVICE_ID[20];   

// ==========================================
// 1. PHẦN XỬ LÝ PHẦN CỨNG
// ==========================================

void my_input_callback(int pin)
{
    xQueueSend(gpio_evt_queue, &pin, 0);
}

static void led_task(void *arg)
{
    uint32_t io_num;
    for (;;)
    {
        if (xQueueReceive(gpio_evt_queue, &io_num, portMAX_DELAY))
        {
            if (io_num == BUTTON_PIN || io_num == TOUCH_PIN)
            {
                toggle_level_output(LED_PIN);
                int current_state = gpio_get_level(LED_PIN);
                printf("Sự kiện: NÚT/CHẠM được kích hoạt! Đèn: %s\n", current_state ? "SÁNG" : "TẮT");

                if (mqtt_client != NULL) {
                    char payload[10];
                    sprintf(payload, "%s", current_state ? "ON" : "OFF");
                    esp_mqtt_client_publish(mqtt_client, TOPIC_STATUS, payload, 0, 0, 0);
                }
            }
        }
    }
}

static void sensor_task(void *arg)
{
    int last_sensor_level = -1;
    int stable_count = 0;
    const int THRESHOLD = 4;

    for (;;)
    {
        int current_sensor_level = gpio_get_level(SENSOR_PIN);

        if (current_sensor_level != last_sensor_level)
        {
            stable_count++;
            
            if (stable_count >= THRESHOLD) 
            {
                last_sensor_level = current_sensor_level;
                gpio_set_level(LED_PIN, current_sensor_level);
                printf("Sự kiện: SENSOR đã ổn định và kích hoạt! Đèn: %s\n", current_sensor_level ? "SÁNG" : "TẮT");

                if (mqtt_client != NULL) {
                    char payload[10];
                    sprintf(payload, "%s", current_sensor_level ? "ON" : "OFF");
                    esp_mqtt_client_publish(mqtt_client, TOPIC_STATUS, payload, 0, 0, 0);
                }
                
                stable_count = 0;
            }
        }
        else 
        {
            stable_count = 0; 
        }
        
        vTaskDelay(pdMS_TO_TICKS(50));
    }
}

static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data)
{
    esp_mqtt_event_handle_t event = event_data;
    switch ((esp_mqtt_event_id_t)event_id)
    {
    case MQTT_EVENT_CONNECTED:
        ESP_LOGI(TAG, "Đã kết nối tới MQTT Broker!");
        esp_mqtt_client_subscribe(mqtt_client, TOPIC_CMD, 0);
        break;

    case MQTT_EVENT_DATA:
        ESP_LOGI(TAG, "Nhận được dữ liệu từ MQTT!");
       

        if (strncmp(event->topic, TOPIC_CMD, event->topic_len) == 0)
        {
            char payload_str[256];
            snprintf(payload_str, sizeof(payload_str), "%.*s", event->data_len, event->data);

            cJSON *root = cJSON_Parse(payload_str);
            
            if (root == NULL) {
                ESP_LOGE(TAG, "Lỗi: Dữ liệu nhận được không phải là JSON hợp lệ!");
            } 
            else {
                cJSON *msg_item = cJSON_GetObjectItem(root, "msg");
                
                if (cJSON_IsString(msg_item) && (msg_item->valuestring != NULL)) 
                {
                    if (strcmp(msg_item->valuestring, "ON") == 0) {
                        gpio_set_level(LED_PIN, 1);
                        ESP_LOGI(TAG, "=> Lệnh bóc từ JSON: BẬT ĐÈN");
                    } 
                    else if (strcmp(msg_item->valuestring, "OFF") == 0) {
                        gpio_set_level(LED_PIN, 0);
                        ESP_LOGI(TAG, "=> Lệnh bóc từ JSON: TẮT ĐÈN");
                    }
                }

                cJSON_Delete(root);
            }
        }
        break;
    default:
        break;
    }
}

static void on_wifi_got_ip_handler(void* arg, esp_event_base_t event_base, int32_t event_id, void* event_data)
{
    if (mqtt_client == NULL) {
        ESP_LOGI(TAG, "Mạng đã sẵn sàng. Khởi tạo MQTT Client...");
        
        const esp_mqtt_client_config_t mqtt_cfg = {
            .broker.address.uri = SECRET_BROKER_URI,
            .credentials.username = SECRET_MQTT_USER,
            .credentials.authentication.password = SECRET_MQTT_PASS,
        };
        
        mqtt_client = esp_mqtt_client_init(&mqtt_cfg);
        esp_mqtt_client_register_event(mqtt_client, ESP_EVENT_ANY_ID, mqtt_event_handler, NULL);
        esp_mqtt_client_start(mqtt_client);
    }
    else {
        ESP_LOGI(TAG, "Mạng đã khôi phục, MQTT Client sẽ tự động kết nối lại ngầm!");
    }
}

void generate_dynamic_topics() {
    uint8_t mac[6];
    esp_efuse_mac_get_default(mac);
    
    sprintf(DEVICE_ID, "LAMP_%02X%02X%02X", mac[3], mac[4], mac[5]); 

    // SỬA TẠI ĐÂY: Dùng %s để chèn SECRET_BASE_TOPIC vào
    sprintf(TOPIC_CMD, "%s/%s/cmd", SECRET_BASE_TOPIC, DEVICE_ID);
    sprintf(TOPIC_STATUS, "%s/%s/trangthai", SECRET_BASE_TOPIC, DEVICE_ID);

    ESP_LOGI(TAG, "Mã thiết bị: %s", DEVICE_ID);
    ESP_LOGI(TAG, "Kênh lắng nghe: %s", TOPIC_CMD);
    ESP_LOGI(TAG, "Kênh báo cáo: %s", TOPIC_STATUS);
}


// ==========================================
// 3. HÀM MAIN
// ==========================================
void app_main(void)
{
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
      ESP_ERROR_CHECK(nvs_flash_erase());
      ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    generate_dynamic_topics();

    gpio_evt_queue = xQueueCreate(10, sizeof(uint32_t));
    create_output(LED_PIN);
    input_set_callback(my_input_callback);
    input_create_button(BUTTON_PIN);
    input_create_sensor(SENSOR_PIN);
    input_create_touch(TOUCH_PIN);

   xTaskCreate(led_task, "led_task", 4096, NULL, 10, NULL);
    xTaskCreate(sensor_task, "sensor_task", 4096, NULL, 4, NULL);
    
    ESP_LOGI(TAG, "Phần cứng đã sẵn sàng!");

    esp_event_handler_instance_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &on_wifi_got_ip_handler, NULL, NULL);

    wifi_init_sta();
}