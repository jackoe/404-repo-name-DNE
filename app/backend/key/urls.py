from django.urls import path, re_path
from key.views import attendance, students, activities, users, misc, reports, groups, permissions

urlpatterns = [
    path('activities/', activities.Activities.as_view()),
    path('students/', students.Students.as_view()),
    path('attendance/', attendance.Attendance.as_view()),
    path('users/', users.Users.as_view()),
    path('groups/', groups.Groups.as_view()),
    path('permissions/', permissions.Permissions.as_view()),
    re_path(r'^reports/(?P<vizType>\w*)/$', reports.Reports.as_view()),
    #above regex maps to: /api/reports/vizType/?arg1=blah&arg2=blah
]