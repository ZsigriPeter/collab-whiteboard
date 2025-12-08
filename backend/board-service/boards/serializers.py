# board/serializers.py
from rest_framework import serializers
from .models import Whiteboard,WhiteboardPermission

class WhiteboardSerializer(serializers.ModelSerializer):

    class Meta:
        model = Whiteboard
        fields = '__all__'
        read_only_fields = [ 'owner_id', 'created_at', 'updated_at', 'share_code']

class WhiteboardPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhiteboardPermission
        fields = ['id', 'whiteboard', 'user_id', 'permission_level', 'granted_at']
        read_only_fields = ['id', 'granted_at']        