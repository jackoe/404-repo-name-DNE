from django.core import serializers
from ..models import Reports as ReportsModel
from ..models import AttendanceItems as AttendanceModel
from ..serializers import ReportSerializer, AttendanceItemSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..helpers import isValidDateTime, isValidTime

class Reports(APIView):

    # Validate input for the.query_params request of this endpoint
    def validateGet(self, request, vizType):
        #need to check if vizType is a valid visualization type,
        #and check if params are valid against the selected vizType
        validateBool = False
        if(vizType == "individualHeatmap"):
            if 'startdate' in request.query_params and 'enddate' in request.query_params and 'student_id' in request.query_params:
                if isValidDateTime(request.query_params['startdate']) and isValidDateTime(request.query_params['enddate']):
                    if request.query_params['student_id'].isnumeric():
                        validateBool = True
        elif(vizType == "alternativeVizType"):
            if 'startdate' in request.query_params and 'enddate' in request.query_params:
                if isValidDateTime(request.query_params['startdate']) and isValidDateTime(request.query_params['enddate']):
                    validateBool = True
 
        return validateBool
     
    def get(self, request, vizType):
        if not self.validateGet(request, vizType):
            return Response({'error':'Invalid Parameters'}, status='400')

        if(vizType == "individualHeatmap"):
            student_id = request.query_params['student_id']
            startdate = request.query_params['startdate']
            enddate = request.query_params['enddate']
            #debugging
            print("vizType: " + vizType)
            print("params: " + student_id + ", " + startdate + ", " + enddate)
            #for value in request.query_params:
                #print ("%s" % (value))
            return self.retrieveIndividualHeatmapData(student_id, startdate, enddate)
        elif(vizType == "alternativeVizType"):
            startdate = request.query_params['startdate']
            enddate = request.query_params['enddate']
            return self.retrieveAttendanceDataInDateRange(startdate, enddate)
            

    # Query databases for data pertaining to a particular student's attendance heatmap
    # Could possibly use attendance model + view here ... instead of reports model
    # as (reports model is basically a copy of attendance model, querying dailyattendance db)
    def retrieveIndividualHeatmapData(self, student_id, startdate, enddate):
        allAttendanceItems = ReportsModel.objects.all().values("student_id", "date")
        allAttendanceItems = allAttendanceItems.order_by('date')
        studentItems = allAttendanceItems.filter(student_id=student_id)
        studentItems = studentItems.filter(date__range=[startdate, enddate])
        serializer = ReportSerializer(studentItems, many=True)
        return Response(serializer.data, content_type='application/json')
    
    #Test method to represent an alternative visualization type
    def retrieveAttendanceDataInDateRange(self, startdate, enddate):
        allAttendanceItems = ReportsModel.objects.all().order_by('date')
        allAttendanceItems = allAttendanceItems.filter(date__range=[startdate, enddate])
        serializer = ReportSerializer(allAttendanceItems, many=True)
        return Response(serializer.data, content_type='application/json')


