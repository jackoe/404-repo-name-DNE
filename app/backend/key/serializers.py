from rest_framework import serializers
from rest_framework_jwt.settings import api_settings
from django.contrib.auth.models import User, Group, Permission
from .models import Students, AttendanceItems, Activity, Reports

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'first_name',
            'last_name',
            'id',
            'first_attendance',
            'number_visits',
            'birthday',
            'nickname',
            'gender',
            'student_id',
        )
        model = Students

class AttendanceItemSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'student_id',
            'date',
            'time',
            'activity_id',
            'id',
            'str_value',
            'num_value'
        )
        model = AttendanceItems

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ('id', 'name', 'content_type_id', 'codename')

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('id', 'name', 'permissions',)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'last_login', 'is_active', 'id', 'groups')

class UserSerializerEdit(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        groups = validated_data.pop('groups', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        if groups is not None:
            instance.groups.set(groups)
        instance.save()
        return instance

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password is not None:
            instance.set_password(password)
        instance.is_active = validated_data.pop('is_active', instance.is_active)
        instance.last_name = validated_data.pop('last_name', instance.last_name)
        instance.first_name = validated_data.pop('first_name', instance.first_name)
        instance.groups.set(validated_data.pop('groups', instance.groups))
        instance.save()
        return instance
        
    class Meta:
        model = User
        fields = ('username', 'password', 'first_name', 'last_name', 'last_login', 'is_active', 'id', 'groups',)

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'name',
            'ordering',
            'is_showing',
            'activity_id',
            'type'
        )
        model = Activity

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'date',
            'daily_visits',
        )
        model = Reports
