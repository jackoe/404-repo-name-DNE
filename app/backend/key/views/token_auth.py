from rest_framework_jwt.views import ObtainJSONWebToken
from rest_framework import permissions
from rest_framework.decorators import permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from key.custom_jwt import jwt_response_payload_handler

class TokenAuth(ObtainJSONWebToken):
    permission_classes = (permissions.AllowAny,)
    def post(self, request,  *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            user = serializer.object.get('user') or request.user
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            token = serializer.object.get('token')
            response_data = jwt_response_payload_handler(token, user, request)
            response = Response(response_data)
            return response

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)