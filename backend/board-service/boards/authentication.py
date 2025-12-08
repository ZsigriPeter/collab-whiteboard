from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from django.conf import settings
import requests

class SharedJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that validates tokens from auth-service
    and fetches user info when needed
    """
    
    def get_user(self, validated_token):
        """
        Get user_id from token. We don't need the full User object
        since we only store user_id in board-service
        """
        try:
            user_id = validated_token.get('user_id')
            if not user_id:
                raise InvalidToken('Token contained no recognizable user identification')
            
            class SimpleUser:
                def __init__(self, user_id):
                    self.id = user_id
                    self.is_authenticated = True
            
            return SimpleUser(user_id)
            
        except Exception as e:
            raise InvalidToken(f'Token is invalid: {str(e)}')
    
    def authenticate(self, request):
        """
        Authenticate the request and return user_id
        """
        result = super().authenticate(request)
        if result is None:
            return None
        
        user, token = result
        return user, token