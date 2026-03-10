from flamapy.interfaces.python.flamapy_feature_model import FLAMAFeatureModel
from flamapy.metamodels.pysat_metamodel.operations import PySATSatisfiableConfiguration
from flamapy.metamodels.configuration_metamodel.models.configuration import Configuration
from pathlib import Path
from django.conf import settings
import os
class FlamapyService:
    _instance = None
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = FlamapyService()
        return cls._instance
    def __init__(self):
        base_dir = Path(settings.BASE_DIR)
        uvl_path = base_dir / "configurador" / "model.uvl"
        self.fm=FLAMAFeatureModel(str(uvl_path))
        self.fm._transform_to_sat()
    def validate(self,features):
        operation=PySATSatisfiableConfiguration()
        configuration=Configuration({feature:True for feature in features})
        operation.set_configuration(configuration)
        operation.execute(self.fm.sat_model)
        return operation.get_result()
    def to_dict_rec(self,feature,relationship):
        diccionary={}
        if relationship:
            diccionary["relationship"]=relationship
        diccionary["name"]=feature.name
        diccionary["children"]=[self.to_dict_rec(child,to_str(relation)) for relation in feature.get_relations() for child in relation.children]
        return diccionary
    def to_dict(self):
        return self.to_dict_rec(self.fm.fm_model.root,None)
def to_str(relation):
    if relation.is_or():
        return "OR"
    if relation.is_alternative():
        return "ALTERNATIVE"
    if relation.is_mandatory():
        return "MANDATORY"
    if relation.is_optional():
        return "OPTIONAL"