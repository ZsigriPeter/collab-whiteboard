from django.contrib import admin
from .models import CanvasObject

@admin.register(CanvasObject)
class CanvasObjectAdmin(admin.ModelAdmin):
    list_display = ['id', 'object_type', 'whiteboard', 'created_by', 'x', 'y', 'created_at', 'locked_by']
    list_filter = ['object_type', 'created_at']
    search_fields = ['whiteboard__name', 'created_by']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Object Info', {
            'fields': ('whiteboard', 'object_type', 'z_index')
        }),
        ('Position & Size', {
            'fields': ('x', 'y', 'width', 'height')
        }),
        ('Styling', {
            'fields': ('color', 'stroke_width')
        }),
        ('Data', {
            'fields': ('data',)
        }),
        ('Tracking', {
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
        ('Locking', {
            'fields': ('locked_by', 'locked_at')
        }),
    )