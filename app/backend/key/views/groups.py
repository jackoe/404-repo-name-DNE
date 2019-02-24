from django.http import HttpResponseRedirect
from django.contrib.auth.models import Group, Permission, User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from ..serializers import GroupSerializer

class Groups(APIView):

    def validatePost(self, request):
        if not 'username' in request.data:
            return False
        if 'permissions' in request.data:
            for perm in request.data['permissions']:
                try:
                    Permission.objects.get(pk=perm)
                except:
                    return False
        return True
    
    def validatePatch(self, request):
        if not 'id' in request.data:
            return False
        try:
            Group.objects.get(pk=request.data['id'])
        except:
            return False
        return True

    def validateDelete(self, request):
        if not 'id' in request.query_params:
            return False
        try:
            Group.objects.get(pk=request.query_params['id'])
        except:
            return False
        return True

    def get(self, request):
        groups = Group.objects.all()
        serializer = GroupSerializer(groups, many=True)
        return Response(serializer.data, content_type='application/json')

    def patch(self, request):
        group = Group.objects.get(pk=request.data['id'])
        serializer = GroupSerializer(group, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, format=None):
        serializer = GroupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        if not self.validateDelete(request):
            return Response({'error':'Invalid Parameters'}, status='400')

        group_id = request.query_params['id']
        group = Group.objects.get(pk=group_id)
        users = User.objects.filter(groups__in=group_id)
        for user in users:
            user.groups.remove(group_id)
        group.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
