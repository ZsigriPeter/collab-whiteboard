from django.db import models
from django.utils import timezone

class Whiteboard(models.Model):
    name = models.CharField(max_length=255)
    owner_id = models.IntegerField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_archived = models.BooleanField(default=False)
    is_public = models.BooleanField(default=False)
    share_code = models.CharField(max_length=20, unique=True, blank=True, null=True)
    
    def __str__(self):
        return self.name

class WhiteboardPermission(models.Model):
    PERMISSION_CHOICES = [
        ('view', 'View Only'),
        ('edit', 'Can Edit'),
        ('admin', 'Admin'),
    ]
    
    whiteboard = models.ForeignKey(Whiteboard, on_delete=models.CASCADE, related_name='permissions')
    user_id = models.IntegerField()
    permission_level = models.CharField(max_length=10, choices=PERMISSION_CHOICES, default='view')
    granted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['whiteboard', 'user_id']
    
    def __str__(self):
        return f"User {self.user_id} - {self.whiteboard.name} ({self.permission_level})"