from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import CanvasObject
from .serializers import (
    CanvasObjectSerializer, 
    CanvasObjectCreateSerializer,
    CanvasObjectUpdateSerializer,
    BulkCanvasObjectSerializer
)
from boards.models import Whiteboard, WhiteboardPermission


class CanvasObjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Canvas Objects
    
    Endpoints:
    - GET /api/canvas/objects/?whiteboard=<id> - List objects for whiteboard
    - POST /api/canvas/objects/ - Create object
    - GET /api/canvas/objects/<id>/ - Get single object
    - PUT /api/canvas/objects/<id>/ - Update object
    - PATCH /api/canvas/objects/<id>/ - Partial update
    - DELETE /api/canvas/objects/<id>/ - Delete object
    - POST /api/canvas/objects/bulk_create/ - Create multiple objects
    - POST /api/canvas/objects/bulk_update/ - Update multiple objects
    - POST /api/canvas/objects/bulk_delete/ - Delete multiple objects
    - POST /api/canvas/objects/<id>/lock/ - Lock object for editing
    - POST /api/canvas/objects/<id>/unlock/ - Unlock object
    """
    
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CanvasObjectCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return CanvasObjectUpdateSerializer
        return CanvasObjectSerializer
    
    def get_queryset(self):
        queryset = CanvasObject.objects.all()
        
        whiteboard_id = self.request.query_params.get('whiteboard')
        if whiteboard_id:
            queryset = queryset.filter(whiteboard_id=whiteboard_id)
        
        object_type = self.request.query_params.get('type')
        if object_type:
            queryset = queryset.filter(object_type=object_type)
        
        return queryset.select_related('whiteboard')
    
    def _check_whiteboard_permission(self, whiteboard_id, required_level='view'):
        """
        Check if user has permission to access whiteboard
        required_level: 'view', 'edit', or 'admin'
        """
        user_id = self.request.user.id
        whiteboard = get_object_or_404(Whiteboard, id=whiteboard_id)
        
        if whiteboard.owner_id == user_id:
            return True
        
        if whiteboard.is_public and required_level == 'view':
            return True
        
        try:
            permission = WhiteboardPermission.objects.get(
                whiteboard=whiteboard,
                user_id=user_id
            )
            
            if required_level == 'view':
                return True
            elif required_level == 'edit':
                return permission.permission_level in ['edit', 'admin']
            elif required_level == 'admin':
                return permission.permission_level == 'admin'
            
        except WhiteboardPermission.DoesNotExist:
            pass
        
        return False
    
    def list(self, request, *args, **kwargs):
        """List canvas objects for a whiteboard"""
        whiteboard_id = request.query_params.get('whiteboard')
        
        if not whiteboard_id:
            return Response(
                {'error': 'whiteboard parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not self._check_whiteboard_permission(whiteboard_id, 'view'):
            return Response(
                {'error': 'You do not have permission to view this whiteboard'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().list(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """Create a new canvas object"""
        whiteboard_id = request.data.get('whiteboard')
        
        if not whiteboard_id:
            return Response(
                {'error': 'whiteboard is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not self._check_whiteboard_permission(whiteboard_id, 'edit'):
            return Response(
                {'error': 'You do not have permission to edit this whiteboard'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """Update a canvas object"""
        obj = self.get_object()
        
        if obj.locked_by and obj.locked_by != request.user.id:
            return Response(
                {'error': 'Object is locked by another user'},
                status=status.HTTP_423_LOCKED
            )
        
        if not self._check_whiteboard_permission(obj.whiteboard.id, 'edit'):
            return Response(
                {'error': 'You do not have permission to edit this whiteboard'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a canvas object"""
        obj = self.get_object()
        
        if not self._check_whiteboard_permission(obj.whiteboard.id, 'edit'):
            return Response(
                {'error': 'You do not have permission to edit this whiteboard'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        Bulk create canvas objects
        
        POST /api/canvas/objects/bulk_create/
        {
            "whiteboard": 1,
            "objects": [
                {
                    "object_type": "rectangle",
                    "x": 100, "y": 100,
                    "width": 200, "height": 150,
                    "color": "#FF0000"
                },
                ...
            ]
        }
        """
        whiteboard_id = request.data.get('whiteboard')
        objects_data = request.data.get('objects', [])
        
        if not whiteboard_id:
            return Response(
                {'error': 'whiteboard is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not self._check_whiteboard_permission(whiteboard_id, 'edit'):
            return Response(
                {'error': 'You do not have permission to edit this whiteboard'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        created_objects = []
        
        with transaction.atomic():
            for obj_data in objects_data:
                obj_data['whiteboard'] = whiteboard_id
                serializer = CanvasObjectCreateSerializer(
                    data=obj_data,
                    context={'request': request}
                )
                
                if serializer.is_valid():
                    obj = serializer.save()
                    created_objects.append(obj)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(
            CanvasObjectSerializer(created_objects, many=True).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """
        Bulk update canvas objects
        
        POST /api/canvas/objects/bulk_update/
        {
            "updates": [
                {"id": 1, "x": 150, "y": 200},
                {"id": 2, "color": "#00FF00"},
                ...
            ]
        }
        """
        updates = request.data.get('updates', [])
        updated_objects = []
        
        with transaction.atomic():
            for update_data in updates:
                obj_id = update_data.pop('id', None)
                
                if not obj_id:
                    continue
                
                try:
                    obj = CanvasObject.objects.get(id=obj_id)
                    
                    if not self._check_whiteboard_permission(obj.whiteboard.id, 'edit'):
                        continue
                    
                    if obj.locked_by and obj.locked_by != request.user.id:
                        continue
                    
                    serializer = CanvasObjectUpdateSerializer(
                        obj,
                        data=update_data,
                        partial=True
                    )
                    
                    if serializer.is_valid():
                        serializer.save()
                        updated_objects.append(obj)
                
                except CanvasObject.DoesNotExist:
                    continue
        
        return Response(
            CanvasObjectSerializer(updated_objects, many=True).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """
        Bulk delete canvas objects
        
        POST /api/canvas/objects/bulk_delete/
        {
            "ids": [1, 2, 3, 4]
        }
        """
        ids = request.data.get('ids', [])
        deleted_count = 0
        
        with transaction.atomic():
            for obj_id in ids:
                try:
                    obj = CanvasObject.objects.get(id=obj_id)
                    
                    if not self._check_whiteboard_permission(obj.whiteboard.id, 'edit'):
                        continue
                    
                    obj.delete()
                    deleted_count += 1
                
                except CanvasObject.DoesNotExist:
                    continue
        
        return Response(
            {'deleted': deleted_count},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def lock(self, request, pk=None):
        """
        Lock an object for editing
        
        POST /api/canvas/objects/<id>/lock/
        """
        obj = self.get_object()
        
        if obj.locked_by and obj.locked_by != request.user.id:
            return Response(
                {'error': 'Object is already locked by another user'},
                status=status.HTTP_423_LOCKED
            )
        
        obj.locked_by = request.user.id
        obj.locked_at = timezone.now()
        obj.save()
        
        return Response(
            CanvasObjectSerializer(obj).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def unlock(self, request, pk=None):
        """
        Unlock an object
        
        POST /api/canvas/objects/<id>/unlock/
        """
        obj = self.get_object()
        
        if obj.locked_by and obj.locked_by != request.user.id:
            return Response(
                {'error': 'You did not lock this object'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        obj.locked_by = None
        obj.locked_at = None
        obj.save()
        
        return Response(
            CanvasObjectSerializer(obj).data,
            status=status.HTTP_200_OK
        )