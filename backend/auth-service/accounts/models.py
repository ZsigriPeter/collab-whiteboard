from django.contrib.auth.models import AbstractUser
from django.db import models
import random

def get_random_color():
    colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6']
    return random.choice(colors)

class User(AbstractUser):
    email = models.EmailField(unique=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    default_color = models.CharField(max_length=7, default=get_random_color)
    bio = models.TextField(blank=True)
    company = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.username