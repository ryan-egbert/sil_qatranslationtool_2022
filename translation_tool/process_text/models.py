from django.db import models

# Create your models here.

class CustomUser(models.Model):
    username = models.CharField(max_length=20, editable=True)
    full_name = models.CharField(max_length=60, editable=True)
    password = models.CharField(max_length=8, editable=True)
