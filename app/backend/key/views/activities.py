from django.core import serializers
from ..models import Activity
from ..serializers import ActivitySerializer
from ..helpers import isValidDateTime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class Activities(APIView):
    def validatePatch(self, request):
        if 'activity_id' in request.data: 
            try:
                Activity.objects.get(pk=request.data['activity_id'])
            except:
                return False
        elif'activity_id1' in request.data and 'activity_id2' in request.data:
            try:
                Activity.objects.get(pk=request.data['activity_id1'])
                Activity.objects.get(pk=request.data['activity_id2'])
            except:
                return False
        else:
            return False
        return True

    def validatePost(self, request):
        if not 'name' in request.data or not 'ordering' in request.data or not 'is_showing' in request.data or not 'type' in request.data:
            return False
        try:
            Activity.objects.get(name=request.data['name'])
            return False
        except:
            return True

    def get(self, request):
        items = Activity.objects.all()

        serializer = ActivitySerializer(items, many=True)
        return Response(serializer.data, content_type='application/json')

    def patch(self, request):
        if not self.validatePatch(request):
            return Response({'error':'Invalid Parameters'}, status='400')
        if 'activity_id' in request.data:
            activity = Activity.objects.get(pk=request.data['activity_id'])
            serializer = ActivitySerializer(activity, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            activity1 = Activity.objects.get(pk=request.data['activity_id1'])
            activity2 = Activity.objects.get(pk=request.data['activity_id2'])
            data1 = {'activity_id': activity1.activity_id, 'ordering': activity2.ordering}
            data2 = {'activity_id': activity2.activity_id, 'ordering': activity1.ordering}
            serializer1 = ActivitySerializer(activity1, data=data1, partial=True)
            serializer2 = ActivitySerializer(activity2, data=data2, partial=True)
            if serializer1.is_valid() and serializer2.is_valid():
                serializer1.save()
                serializer2.save()
                return Response([serializer1.data, serializer2.data], status=status.HTTP_201_CREATED)
            return Response([serializer1.errors, serializer2.errors], status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, format=None):
        if not self.validatePost(request):
            return Response({'error':'Invalid Parameters'}, status='400')
        serializer = ActivitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
