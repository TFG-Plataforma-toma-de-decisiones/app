from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.contrib.auth.models import AbstractUser
# Create your models here.
class Language(models.Model):
    name=models.CharField(max_length=100,blank=False,unique=True)
class Project(models.Model):
    
    name=models.CharField(max_length=255,blank=False)
    description=models.TextField(blank=False)
    language=models.ForeignKey(Language,on_delete=models.PROTECT,related_name="+")
    TYPE_CHOICES = (
        ("Frontend", "Frontend"),
        ("Backend", "Backend"),
        ("Full Stack","Full Stack"),
        ("Frontend Library", "Frontend Library"),
        ("Backend Library", "Backend Library"),
    )
    type=models.CharField(max_length=50,choices=TYPE_CHOICES)
    features=ArrayField(models.CharField(max_length=255,blank=False),default=list)
class User(AbstractUser):
    pass