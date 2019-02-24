from django.test import TestCase
from .models import Youth

# Create your tests here.
class YouthModelTest(TestCase):
	@classmethod
	def setUpTestData(cls):
		Youth.objects.create(name='Patrick Wigent', key=True)

	def test_name_content(self):
		youth = Youth.objects.get(id=1)
		expected_object_name = f'{youth.name}'
		self.assertEquals(expected_object_name, 'Patrick Wigent')

	def test_description_content(self):
		youth = Youth.objects.get(id=1)
		expected_object_name = youth.key
		self.assertEquals(expected_object_name, True)
