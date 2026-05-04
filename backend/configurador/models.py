from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.contrib.auth.models import AbstractUser
# Create your models here.
class Language(models.Model):
    name=models.CharField(max_length=100,blank=False,unique=True)
class Project(models.Model):
    
    name=models.CharField(max_length=255,blank=False,unique=True)
    description=models.TextField(blank=False)
    language=models.ForeignKey(Language,on_delete=models.PROTECT,related_name="+")
    features=ArrayField(models.CharField(max_length=255,blank=False),default=list)
    compatible_projects = models.ManyToManyField(
    "self",
    symmetrical=False,
    blank=True,
    related_name="compatible_libraries"
    )
class User(AbstractUser):
    pass
class UVLModel(models.Model):
    raw_content=models.TextField(blank=False)