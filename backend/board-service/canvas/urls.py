from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CanvasObjectViewSet

router = DefaultRouter()
router.register(r'objects', CanvasObjectViewSet, basename='canvas-object')

urlpatterns = [
    path('', include(router.urls)),
]