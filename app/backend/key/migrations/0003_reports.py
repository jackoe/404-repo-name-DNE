# Generated by Django 2.1.5 on 2019-02-06 00:35

from django.db import migrations, models
import key.helpers


class Migration(migrations.Migration):

    dependencies = [
        ('key', '0002_auto_20190125_2232'),
    ]

    operations = [
        migrations.CreateModel(
            name='Reports',
            fields=[
                ('student_id', models.IntegerField(blank=True, primary_key=True, serialize=False)),
                ('date', models.DateField(default=key.helpers.getCurrentDate)),
                ('time', models.TimeField(default=key.helpers.getCurrentTime)),
                ('activity_id', models.IntegerField(blank=True, null=True)),
                ('visit_number', models.IntegerField(blank=True, null=True)),
                ('daily_visits', models.IntegerField(blank=True, null=True)),
            ],
            options={
                'db_table': 'dailyattendance',
                'managed': False,
            },
        ),
    ]
