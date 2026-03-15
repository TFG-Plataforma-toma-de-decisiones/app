from rest_framework import serializers
from .models import Project,Language,User
class ProjectSerializer(serializers.ModelSerializer):
    language = serializers.SlugRelatedField(
        queryset=Language.objects.all(),  
        slug_field='name'             
    )
    class Meta:
        model = Project
        fields = '__all__'
class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = '__all__'
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=["is_staff"]