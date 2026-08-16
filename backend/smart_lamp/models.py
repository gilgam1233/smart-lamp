from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    gender = models.BooleanField(default=1, null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    dob = models.DateField(null=True, blank=True)

    REQUIRED_FIELDS = ['email', 'gender', 'phone', 'dob']

    def __str__(self):
        return self.username

class SmartLamp(models.Model):
    device_id = models.CharField(max_length=50, unique=True)
    user = models.ForeignKey(User,on_delete=models.SET_NULL,related_name='lamp',null=True)
    is_active = models.BooleanField(default=True)
    name = models.CharField(max_length=50)
    status = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.device_id})"