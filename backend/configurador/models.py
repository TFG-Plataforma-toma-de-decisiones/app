from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.contrib.auth.models import AbstractUser
# Create your models here.
class Project(models.Model):
    
    name=models.CharField(max_length=255,blank=False,unique=True)
    description=models.TextField(blank=False)
    language=models.CharField(max_length=100,blank=False)
    TYPE_CHOICES = (
        ("Frontend", "Frontend"),
        ("Backend", "Backend"),
        ("Frontend library", "Frontend library"),
        ("Backend library", "Backend library"),
    )
    type=models.CharField(max_length=50,choices=TYPE_CHOICES)
    features=ArrayField(models.TextField(blank=False),default=list)
class User(AbstractUser):
    pass