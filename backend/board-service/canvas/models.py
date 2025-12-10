from django.db import models
from django.utils import timezone
from boards.models import Whiteboard

class CanvasObject(models.Model):
    OBJECT_TYPES = [
        ('rectangle', 'Rectangle'),
        ('circle', 'Circle'),
        ('triangle', 'Triangle'),
        ('line', 'Line'),
        ('arrow', 'Arrow'),
        ('freehand', 'Freehand'),
        ('text', 'Text'),
        ('sticky_note', 'Sticky Note'),
        ('image', 'Image'),
    ]
    
    whiteboard = models.ForeignKey(Whiteboard, on_delete=models.CASCADE, related_name='canvas_objects')
    object_type = models.CharField(max_length=20, choices=OBJECT_TYPES)
    
    x = models.FloatField()
    y = models.FloatField()
    width = models.FloatField(null=True, blank=True)
    height = models.FloatField(null=True, blank=True)
    
    color = models.CharField(max_length=7, default="#000000")
    stroke_width = models.IntegerField(default=2)
    z_index = models.IntegerField(default=0)
    
    data = models.JSONField(default=dict)
    
    created_by = models.IntegerField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    locked_by = models.IntegerField(null=True, blank=True)
    locked_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['z_index', 'created_at']
    
    def __str__(self):
        return f"{self.object_type} on {self.whiteboard.name}"