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
INCOMPATIBLE_TYPES = [
    {"Full Stack", "Backend"},
    {"Full Stack", "Frontend"},
]
class RelationSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=[
        ("ALTERNATIVE", "ALTERNATIVE"),
        ("MANDATORY", "MANDATORY"),
        ("OPTIONAL", "OPTIONAL"),
        ("OR", "OR")
    ])

    def get_fields(self):
        fields = super().get_fields()
        # Inyección dinámica para evitar referencias circulares.
        # Usamos many=True como motor nativo de listas de DRF.
        fields['children'] = UVLModelSerializer(
            many=True, 
            allow_empty=False
        )
        return fields

class UVLModelSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, allow_blank=False)
    
    # Usamos RelationSerializer directamente con many=True
    relations = RelationSerializer(
        many=True,
        required=False,    
        allow_empty=True,  
        default=list
    )
    
    attributes = serializers.DictField(
        child=serializers.CharField(allow_blank=False),
        required=False,
        default=dict
    )

    def validate_attributes(self, value):
        for key in value.keys():
            if not str(key).strip():
                raise serializers.ValidationError("La clave no puede estar vacía.")
        return value

    def validate_relations(self, value):
        """
        'value' es una lista de diccionarios con la estructura ya validada
        por RelationSerializer.
        """
        # 1. Solo aplicamos esta lógica estricta al nivel principal (nodo raíz)
        if self == self.root:
            if not value:
                raise serializers.ValidationError("El nodo raíz debe tener al menos una relación definida.")
            
            primer_nodo = value[0]
            if len(value)>1:
                raise serializers.ValidationError("El primer nivel solo debe de tener una relación alternativa")
            # 2. Validar que la raíz sea ALTERNATIVE
            if primer_nodo.get("type") != "ALTERNATIVE":
                raise serializers.ValidationError(
                    "La primera relación del nodo raíz debe ser 'ALTERNATIVE'."
                )
            
            # 3. Validar que tenga exactamente estos hijos
            hijos = primer_nodo.get("children", [])
            nombres_hijos = {hijo.get("name") for hijo in hijos}
            
            nombres_requeridos = {
                "Backend", 
                "Frontend", 
                "Full Stack", 
                "Backend Library", 
                "Frontend Library"
            }
            
            if nombres_hijos != nombres_requeridos:
                faltan = nombres_requeridos - nombres_hijos
                sobran = nombres_hijos - nombres_requeridos
                
                error_msg = "Los hijos del nodo raíz no son válidos."
                if faltan:
                    error_msg += f" Faltan: {', '.join(faltan)}."
                if sobran:
                    error_msg += f" No permitidos aquí: {', '.join(sobran)}."
                
                raise serializers.ValidationError(error_msg)

        # Para los nodos que no son raíz, simplemente retornamos el valor para que fluya
        return value
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


class SWOTPdfExportSerializer(serializers.Serializer):
    strengths = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=True
    )
    opportunities = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=True
    )
    weaknesses = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=True
    )
    threats = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=True
    )
