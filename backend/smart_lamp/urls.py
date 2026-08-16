from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'users', views.UserViewSet, basename='user')
router.register(r'lamps', views.SmartLampViewSet, basename='lamp')

urlpatterns = [
    path('', include(router.urls)),
]