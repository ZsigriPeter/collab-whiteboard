from django.db import models
from django.utils import timezone
import uuid

class Whiteboard(models.Model):
    name = models.CharField(max_length=255)
    owner_id = models.PositiveIntegerField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_archived = models.BooleanField(default=False)
    is_public = models.BooleanField(default=False)
    share_code = models.CharField(max_length=20, unique=True, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.share_code:
            self.share_code = uuid.uuid4().hex[:12].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} (owner: {self.owner_id})"

    class Meta:
        ordering = ['-created_at']

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