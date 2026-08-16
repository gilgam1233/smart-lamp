import os
import random
import paho.mqtt.client as mqtt_client
import json

BROKER = os.environ.get('MQTT_BROKER')
PORT = int(os.environ.get('MQTT_PORT'))
BASE_TOPIC = os.environ.get('MQTT_BASE_TOPIC')

MQTT_USER = os.environ.get('MQTT_USER')
MQTT_PASS = os.environ.get('MQTT_PASS')

client_id = f'django-backend-{random.randint(0, 1000)}'


def on_connect(client, userdata, flags, reason_code, properties):
    if reason_code == 0:
        client.subscribe(f"{BASE_TOPIC}/+/trangthai")
    else:
        print(f"Kết nối MQTT thất bại, mã lỗi (reason_code): {reason_code}")


def on_message(client, userdata, msg):
    from .models import SmartLamp

    topic = msg.topic
    payload = msg.payload.decode("utf-8")

    topic_parts = topic.split('/')

    if len(topic_parts) == 3:
        device_id = topic_parts[1]

        is_on = True if payload == "ON" else False

        print(f"MQTT Nhận: Đèn {device_id} -> {payload}")

        SmartLamp.objects.filter(device_id=device_id).update(status=is_on)

client = mqtt_client.Client(
    client_id=client_id,
    callback_api_version=mqtt_client.CallbackAPIVersion.VERSION2
)

if MQTT_USER and MQTT_PASS:
    client.username_pw_set(MQTT_USER, MQTT_PASS)

client.on_connect = on_connect
client.on_message = on_message

def start_mqtt():
    try:
        client.connect(BROKER, PORT, 60)
        client.loop_start()
    except Exception as e:
        print("Lỗi kết nối MQTT:", e)

def publish_command(device_id, command):
    topic = f"{BASE_TOPIC}/{device_id}/cmd"
    payload_json = json.dumps({"msg": command})

    client.publish(topic, payload_json)