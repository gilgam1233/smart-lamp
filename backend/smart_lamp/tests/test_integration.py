from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from smart_lamp.models import SmartLamp
from smart_lamp.mqtt import on_message

import smart_lamp.mqtt

from unittest.mock import patch


User = get_user_model()


class IntegrationTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="user1",
            password="12345678"
        )

        self.lamp = SmartLamp.objects.create(
            device_id="LAMP_TEST01",
            name="Đèn phòng khách",
            status=False,
            user=self.user
        )

        self.client.force_authenticate(
            user=self.user
        )

    @patch("smart_lamp.mqtt.client.publish")
    def test_django_publish_mqtt_command(self, mock_publish):

        url = "/lamps/toggle/"

        response = self.client.post(
            url,
            {
                "device_id": self.lamp.device_id,
                "command": "ON"
            },
            format="json",
            secure= True
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        mock_publish.assert_called_once()

        topic, payload = mock_publish.call_args.args[:2]

        self.assertEqual(
            topic,
            f"{smart_lamp.mqtt.BASE_TOPIC}/{self.lamp.device_id}/cmd"
        )

        self.assertEqual(
            payload,
            '{"msg": "ON"}'
        )

    def test_mqtt_status_updates_database(self):

        class FakeMessage:
            topic = f"{smart_lamp.mqtt.BASE_TOPIC}/{self.lamp.device_id}/trangthai"
            payload = b"ON"

        on_message(
            None,
            None,
            FakeMessage()
        )

        self.lamp.refresh_from_db()

        self.assertTrue(
            self.lamp.status
        )

    def test_mqtt_status_off_updates_database(self):

        self.lamp.status = True
        self.lamp.save()

        class FakeMessage:
            topic = f"{smart_lamp.mqtt.BASE_TOPIC}/{self.lamp.device_id}/trangthai"
            payload = b"OFF"

        on_message(
            None,
            None,
            FakeMessage()
        )

        self.lamp.refresh_from_db()

        self.assertFalse(
            self.lamp.status
        )

    def test_add_lamp_updates_database(self):
        lamp = SmartLamp.objects.create(
            device_id="LAMP_TEST02",
            name="Đèn thông minh",
            status=False,
            user=None
        )

        response = self.client.post(
            "/lamps/add/",
            {
                "device_id": lamp.device_id,
                "name": "Đèn phòng ngủ"
            },
            format="json",
            secure=True
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        lamp.refresh_from_db()

        self.assertEqual(lamp.user, self.user)
        self.assertEqual(lamp.name, "Đèn phòng ngủ")

    def test_rename_lamp_updates_database(self):
        response = self.client.patch(
            f"/lamps/{self.lamp.device_id}/rename/",
            {
                "name": "Đèn bàn"
            },
            format="json",
            secure=True
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.lamp.refresh_from_db()

        self.assertEqual(
            self.lamp.name,
            "Đèn bàn"
        )

    def test_remove_lamp_updates_database(self):
        response = self.client.delete(
            f"/lamps/{self.lamp.device_id}/remove/",
            secure=True
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.lamp.refresh_from_db()

        self.assertIsNone(
            self.lamp.user
        )

        self.assertEqual(
            self.lamp.name,
            "Đèn thông minh"
        )