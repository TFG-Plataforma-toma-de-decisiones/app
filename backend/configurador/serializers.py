from rest_framework import serializers
from .models import Project,Language,User
from configurador.flamapy.flamapyService import FlamapyService
class ProjectSerializer(serializers.ModelSerializer):
    language = serializers.SlugRelatedField(
        queryset=Language.objects.all(),  
        slug_field='name'             
    )
    def validate_features(self, value):
        service = FlamapyService.get_instance()
        if not service.validate(value,True):
            raise serializers.ValidationError("Features not valid")
        return value  
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