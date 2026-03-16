from rest_framework import serializers
from .models import Project,Language,User
from configurador.flamapy.flamapyService import FlamapyService
class CreatableSlugRelatedField(serializers.SlugRelatedField):
    def to_internal_value(self, data):
        try:
            return self.get_queryset().get_or_create(**{self.slug_field: data})[0]
        except (TypeError, ValueError):
            self.fail('invalid')
class ProjectSerializer(serializers.ModelSerializer):
    language = CreatableSlugRelatedField(
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