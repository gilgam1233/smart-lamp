from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from smart_lamp.models import SmartLamp

from unittest.mock import patch


User = get_user_model()


class UserUnitTest(APITestCase):

    def test_register_user_success(self):
        url = "/users/"

        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "12345678",
            "gender": True,
            "phone": "0900000000",
            "dob": "2000-01-01",
        }

        response = self.client.post(
            url,
            data,
            format="json",
            secure=True
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertTrue(
            User.objects.filter(
                username="testuser"
            ).exists()
        )


class ProfileUnitTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="12345678",
            email="test@example.com"
        )

        self.client.force_authenticate(
            user=self.user
        )

    def test_update_profile(self):
        url = "/users/profile/"

        data = {
            "first_name": "Nguyen",
            "last_name": "Hao",
            "phone": "0900000000"
        }

        response = self.client.patch(
            url,
            data,
            format="json",
            secure= True
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.user.refresh_from_db()

        self.assertEqual(
            self.user.first_name,
            "Nguyen"
        )

        self.assertEqual(
            self.user.phone,
            "0900000000"
        )

class SmartLampUnitTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="user1",
            password="12345678"
        )

        self.other_user = User.objects.create_user(
            username="user2",
            password="12345678"
        )

        self.lamp = SmartLamp.objects.create(
            device_id="LAMP_TEST01",
            name="Đèn phòng khách",
            status=False,
            user=self.user
        )

        self.unlinked_lamp = SmartLamp.objects.create(
            device_id="LAMP_TEST02",
            name="Đèn thông minh",
            status=False,
            user=None
        )

        self.other_lamp = SmartLamp.objects.create(
            device_id="LAMP_TEST03",
            name="Đèn phòng ngủ",
            status=False,
            user=self.other_user
        )

        self.client.force_authenticate(
            user=self.user
        )

    def test_get_lamp_list(self):
        url = "/lamps/"

        response = self.client.get(url,
            secure= True)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            len(response.data),
            1
        )

        self.assertEqual(
            response.data[0]["device_id"],
            "LAMP_TEST01"
        )

    def test_add_lamp(self):
        url = "/lamps/add/"

        data = {
            "device_id": "LAMP_TEST02",
            "name": "Đèn phòng ngủ"
        }

        response = self.client.post(
            url,
            data,
            format="json",
            secure= True
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.unlinked_lamp.refresh_from_db()

        self.assertEqual(
            self.unlinked_lamp.user,
            self.user
        )

        self.assertEqual(
            self.unlinked_lamp.name,
            "Đèn phòng ngủ"
        )

    def test_rename_lamp(self):
        url = f"/lamps/{self.lamp.device_id}/rename/"

        response = self.client.patch(
            url,
            {
                "name": "Đèn bàn"
            },
            format="json",
            secure= True
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

    def test_remove_lamp(self):
        url = f"/lamps/{self.lamp.device_id}/remove/"

        response = self.client.delete(url,
            secure= True)

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

    def test_cannot_access_other_users_lamp(self):
        url = f"/lamps/{self.other_lamp.device_id}/rename/"

        response = self.client.patch(
            url,
            {
                "name": "Đổi tên trái phép"
            },
            format="json",
            secure= True
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )

    @patch("smart_lamp.views.publish_command")
    def test_toggle_lamp(self, mock_publish):
        url = "/lamps/toggle/"

        data = {
            "device_id": self.lamp.device_id,
            "command": "ON"
        }

        response = self.client.post(
            url,
            data,
            format="json",
            secure= True
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        mock_publish.assert_called_once_with(
            self.lamp.device_id,
            "ON"
        )