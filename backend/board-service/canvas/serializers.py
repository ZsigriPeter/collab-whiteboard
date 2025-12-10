from rest_framework import serializers
from .models import CanvasObject
from boards.models import Whiteboard

class CanvasObjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = CanvasObject
        fields = [
            'id', 'whiteboard', 'object_type', 
            'x', 'y', 'width', 'height',
            'color', 'stroke_width', 'z_index',
            'data',
            'created_by', 'created_at', 'updated_at',
            'locked_by', 'locked_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def validate_whiteboard(self, value):
        """Ensure whiteboard exists"""
        if not Whiteboard.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Whiteboard does not exist")
        return value
    
    def validate_color(self, value):
        """Validate hex color format"""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError("Color must be in hex format (#RRGGBB)")
        return value


class CanvasObjectCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating canvas objects"""
    
    class Meta:
        model = CanvasObject
        fields = [
            'whiteboard', 'object_type', 
            'x', 'y', 'width', 'height',
            'color', 'stroke_width', 'z_index',
            'data'
        ]
    
    def create(self, validated_data):
        # Set created_by from request context
        validated_data['created_by'] = self.context['request'].user.id
        return super().create(validated_data)


class CanvasObjectUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating canvas objects (position, style, etc.)"""
    
    class Meta:
        model = CanvasObject
        fields = [
            'x', 'y', 'width', 'height',
            'color', 'stroke_width', 'z_index',
            'data'
        ]


class BulkCanvasObjectSerializer(serializers.Serializer):
    """Serializer for bulk operations"""
    objects = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=False
    )