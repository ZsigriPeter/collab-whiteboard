# board/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WhiteboardViewSet

router = DefaultRouter()
router.register(r'whiteboards', WhiteboardViewSet, basename='whiteboard')

urlpatterns = [
    path('', include(router.urls)),
    path('health/', lambda request: Response({'status': 'healthy'}), name='health'),
]