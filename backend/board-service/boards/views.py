# board/views.py
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from .models import Whiteboard
from .serializers import WhiteboardSerializer

class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner_id == request.user.id

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

class WhiteboardViewSet(viewsets.ModelViewSet):
    serializer_class = WhiteboardSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user_id = self.request.user.id
        
        owned = Whiteboard.objects.filter(owner_id=user_id)
        shared = Whiteboard.objects.filter(permissions__user_id=user_id)
        
        return (owned | shared).distinct()
    
    def perform_create(self, serializer):
        serializer.save(owner_id=self.request.user.id)
    
    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """Share whiteboard with another user"""
        whiteboard = self.get_object()
        
        if whiteboard.owner_id != request.user.id:
            return Response(
                {'error': 'Only owner can share whiteboard'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user_id = request.data.get('user_id')
        permission_level = request.data.get('permission_level', 'view')
        
        permission, created = WhiteboardPermission.objects.get_or_create(
            whiteboard=whiteboard,
            user_id=user_id,
            defaults={'permission_level': permission_level}
        )
        
        if not created:
            permission.permission_level = permission_level
            permission.save()
        
        return Response(
            WhiteboardPermissionSerializer(permission).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )