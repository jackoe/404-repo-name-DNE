from django.http import HttpResponseRedirect
from django.contrib.auth.models import Permission
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from ..serializers import PermissionSerializer
from django.db.models import Q
from django.contrib.contenttypes.models import ContentType

class Permissions(APIView):

    def get(self, request):
        permissions = Permission.objects.all()
        content_types = ContentType.objects.filter(Q(model='activity') | Q(model='attendanceitems') | Q(model='studentcolumn') | Q(model='studentinfo') | Q(model='students') | Q(model='group') | Q(model='user'))
        permissions = []
        for content_type in content_types:
            permissions.extend(list(Permission.objects.filter(content_type_id=content_type.id)))
        serializer = PermissionSerializer(permissions, many=True)
        return Response(serializer.data, content_type='application/json')