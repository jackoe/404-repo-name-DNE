from .serializers import UserSerializer, GroupSerializer
from datetime import datetime
from rest_framework_jwt.settings import api_settings
from django.contrib.auth.models import Permission, Group

def jwt_payload_handler(user):
    return {
        'user_id': user.pk,
        'is_staff': user.is_staff,
        'username': user.username,
        'exp': datetime.utcnow() + api_settings.JWT_EXPIRATION_DELTA
    }

def jwt_response_payload_handler(token, user, request):
    serialized_user = UserSerializer(user, context={'request': request}).data
    groups = serialized_user['groups']
    permission_names = []
    if len(groups) > 0:
        group = Group.objects.get(pk=groups[0])
        serialized_group = GroupSerializer(group).data
        permissions = Permission.objects.all()
        for id in serialized_group['permissions']:
            permission = permissions.get(pk=id)
            permission_names.append(permission.codename)
    return {
        'token': token,
        'user': serialized_user,
        'permissions': permission_names
    }