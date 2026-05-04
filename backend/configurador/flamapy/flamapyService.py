from flamapy.interfaces.python.flamapy_feature_model import FLAMAFeatureModel
from flamapy.metamodels.pysat_metamodel.operations import PySATSatisfiableConfiguration
from flamapy.metamodels.configuration_metamodel.models.configuration import Configuration
from pathlib import Path
from django.conf import settings
import os
import tempfile
from django.core.cache import cache
from itertools import groupby
from django.db import transaction
from configurador.models import UVLModel
default_uvl_nodes=["Backend","Frontend",'"Full Stack"','"Backend Library"','"Frontend Library"']

class FlamapyService:
    _instance = None
    _version=0
    @classmethod
    def get_instance(cls):
        version_actual_redis = cache.get('uvl_model_version', 1)
        if cls._instance is None or cls._version < version_actual_redis:
            model=UVLModel.objects.first()
            if model:
                uvl_content=model.raw_content
            else:
                default_uvl_nodes_text="\n\t\t\t".join(default_uvl_nodes)
                uvl_content=f"features\n\tProject\n\t\talternative\n\t\t\t{default_uvl_nodes_text}"
                print(uvl_content)
            cls._instance = FlamapyService.create_str(uvl_content)
            cls._version = version_actual_redis
            
        return cls._instance
    def __init__(self,uvl_path):
        self.fm=FLAMAFeatureModel(str(uvl_path))
        self.fm._transform_to_sat()
    def validate(self,features,is_full):
        operation=PySATSatisfiableConfiguration()
        configuration=Configuration(elements={feature:True for feature in features})
        configuration.set_full(is_full)
        operation.set_configuration(configuration)
        try:
            operation.execute(self.fm.sat_model)
            valid=operation.get_result()
        except KeyError:
            valid=False
        return valid
    def to_dict_rec(self,feature):
        diccionary = {}
        diccionary["name"] = feature.name
        diccionary["relations"] = [
            {
                "type": to_str(relation),
                "children": [self.to_dict_rec(child) for child in relation.children],
            }
            for relation in feature.get_relations()
        ]
        diccionary['attributes']={attribute.name:attribute.default_value for attribute in feature.get_attributes()}
        return diccionary

    def to_dict(self):
        return self.to_dict_rec(self.fm.fm_model.root)
    @classmethod
    def create_str(cls,uvl):
        with tempfile.NamedTemporaryFile(mode='w', suffix='.uvl', encoding='utf-8', delete=False) as temp_file:
            temp_file.write(uvl)
            temp_path = temp_file.name
        try:
            flamapy_service=cls(temp_path)
            return flamapy_service
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    @classmethod
    def publish_new_model(cls, new_uvl_content):
        with transaction.atomic():
            UVLModel.objects.update_or_create(
            defaults={'raw_content': new_uvl_content}
        )
        try:
            cache.incr('uvl_model_version')
        except ValueError:
            cache.set('uvl_model_version', 2, timeout=None)
        #cls._instance = cls(uvl_path)
        return True
    @classmethod
    def get_uvl_text(cls,node):
        return 'features\n'+get_uvl_text_rec(node,1)
    
def get_uvl_text_rec(node,tabs):
    attributes='{'+','.join(f" {key} '{value}'" for key,value in node['attributes'].items())+'}'
    
    res='\t'*tabs+'"'+node["name"]+'"'+' '+attributes
    for relation in node["relations"]:
        res += '\n' + '\t' * (tabs+1) + relation["type"].lower()
        for child in relation["children"]:
            res+='\n'+get_uvl_text_rec(child,tabs+2)
    return res
def to_str(relation):
    if relation.is_or():
        return "OR"
    if relation.is_alternative():
        return "ALTERNATIVE"
    if relation.is_mandatory():
        return "MANDATORY"
    if relation.is_optional():
        return "OPTIONAL"
