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
        valid,message=service.validate(value,True)
        if not valid:
            raise serializers.ValidationError(message)
        return value  
    class Meta:
        model = Project
        fields = '__all__'
INCOMPATIBLE_TYPES = [
    {"Full Stack", "Backend"},
    {"Full Stack", "Frontend"},
]

class ConfiguratorBranchListSerializer(serializers.ListSerializer):
    def validate(self, data):
        branch_types = [item["type"] for item in data]

        if len(branch_types) != len(set(branch_types)):
            raise serializers.ValidationError("There can´t be duplicated branches.")

        selected_types = set(branch_types)
        for invalid_pair in INCOMPATIBLE_TYPES:
            if invalid_pair.issubset(selected_types):
                raise serializers.ValidationError(
                    f"Invalid branch combination: {', '.join(sorted(invalid_pair))}"
                )

        return data


class ConfiguratorBranchSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=["Backend", "Frontend", "Full Stack"])
    languages = serializers.SlugRelatedField(
        slug_field="name",
        queryset=Language.objects.all(),
        allow_empty=True,
        many=True
    )
    features = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False
    )

    class Meta:
        list_serializer_class = ConfiguratorBranchListSerializer
    def validate(self, data):
        service = FlamapyService.get_instance()
        branch_type = data["type"]
        features = data["features"]
        if branch_type not in features:
            features.append(branch_type)
        if not service.validate(features, is_full=False):
            raise serializers.ValidationError({
                "features": "The branch is not valid according to UVL model."
            })
        return data

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = '__all__'
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=["is_staff"]