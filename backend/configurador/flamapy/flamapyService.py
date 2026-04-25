from pathlib import Path
import os
import tempfile

from django.conf import settings
from django.core.cache import cache
from flamapy.interfaces.python.flamapy_feature_model import FLAMAFeatureModel
from flamapy.metamodels.configuration_metamodel.models.configuration import Configuration
from flamapy.metamodels.pysat_diagnosis_metamodel.operations import PySATConflict
from flamapy.metamodels.pysat_diagnosis_metamodel.transformations import FmToDiagPysat
from flamapy.metamodels.pysat_metamodel.operations import PySATSatisfiableConfiguration


class FlamapyService:
    _instance = None
    _version = 0

    @classmethod
    def get_instance(cls):
        version = cache.get("uvl_model_version", 1)
        uvl_path = Path(settings.UVL_MODEL_FILE)
        if cls._version < version:
            cls._instance = cls(uvl_path)
            cls._version = version
        return cls._instance

    def __init__(self, uvl_path):
        self.fm = FLAMAFeatureModel(str(uvl_path))
        self.fm._transform_to_sat()
        self.feature_names = self._collect_feature_names(self.fm.fm_model.root)
        self._diagnosis_model = None

    def validate(self, features, is_full):
        unknown_features = sorted(set(features) - self.feature_names)
        if unknown_features:
            return False, [
                f'La caracteristica "{feature}" no existe en el modelo UVL.'
                for feature in unknown_features
            ]

        operation = PySATSatisfiableConfiguration()
        configuration = Configuration(elements={feature: True for feature in features})
        configuration.set_full(is_full)
        operation.set_configuration(configuration)

        try:
            operation.execute(self.fm.sat_model)
            valid = operation.get_result()
        except KeyError as exc:
            feature_name = exc.args[0] if exc.args else "desconocida"
            return False, [f'La caracteristica "{feature_name}" no existe en el modelo UVL.']
        except Exception:
            return False, ["No se ha podido validar la configuracion contra el modelo UVL."]

        if valid:
            return True, []

        errores_ui = self.diagnose_configuration(features, is_full)
        if errores_ui:
            return False, errores_ui

        if is_full:
            return False, ["La configuracion completa no es valida segun el modelo UVL."]
        return False, ["La seleccion actual no puede completarse en una configuracion valida."]

    def diagnose_configuration(self, features, is_full):
        test_case = Configuration(elements=self._build_test_case_elements(features, is_full))
        test_case.set_full(is_full)
        operation = PySATConflict()
        operation.set_test_case(test_case)
        operation.execute(self._get_diagnosis_model())
        return self._extract_useful_diagnosis_messages(operation.get_result())

    def _extract_useful_diagnosis_messages(self, messages):
        conflict_messages = [
            message for message in messages
            if message.startswith("Conflict:") or message.startswith("Conflicts:")
        ]
        if conflict_messages:
            return conflict_messages

        diagnosis_messages = [
            message for message in messages
            if message.startswith("Diagnosis:") or message.startswith("Diagnoses:")
        ]
        if diagnosis_messages:
            return diagnosis_messages

        return []

    def _get_diagnosis_model(self):
        if self._diagnosis_model is None:
            self._diagnosis_model = FmToDiagPysat(self.fm.fm_model).transform()
        return self._diagnosis_model

    def _build_test_case_elements(self, features, is_full):
        selected_features = set(features)
        if not is_full:
            return {feature: True for feature in selected_features}
        return {
            feature: feature in selected_features
            for feature in self.feature_names
        }

    def _collect_feature_names(self, feature):
        feature_names = {feature.name}
        for relation in feature.get_relations():
            for child in relation.children:
                feature_names.update(self._collect_feature_names(child))
        return feature_names

    def to_dict_rec(self, feature):
        diccionary = {}
        diccionary["name"] = feature.name
        diccionary["relations"] = [
            {
                "type": to_str(relation),
                "children": [self.to_dict_rec(child) for child in relation.children],
                "attributes": {
                    attribute.name: attribute.default_value
                    for attribute in feature.get_attributes()
                },
            }
            for relation in feature.get_relations()
        ]
        return diccionary

    def to_dict(self):
        return self.to_dict_rec(self.fm.fm_model.root)

    @classmethod
    def create_str(cls, uvl):
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".uvl", encoding="utf-8", delete=False
        ) as temp_file:
            temp_file.write(uvl)
            temp_path = temp_file.name
        try:
            flamapy_service = cls(temp_path)
            return flamapy_service
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    @classmethod
    def publish_new_model(cls, new_uvl_content):
        uvl_path = Path(settings.UVL_MODEL_FILE)
        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".tmp",
            encoding="utf-8",
            delete=False,
            dir=uvl_path.parent,
        ) as tmp_file:
            tmp_file.write(new_uvl_content)
            tmp_path = tmp_file.name
        os.replace(tmp_path, uvl_path)
        if cache.get("uvl_model_version") is None:
            cache.set("uvl_model_version", 1, timeout=None)
        cache.incr("uvl_model_version")
        return True

    @classmethod
    def get_uvl_text(cls, node):
        return "features\n" + get_uvl_text_rec(node, 1)


def get_uvl_text_rec(node, tabs):
    res = "\t" * tabs + '"' + node["name"] + '"'
    for relation in node["relations"]:
        res += "\n" + "\t" * (tabs + 1) + relation["type"].lower()
        for child in relation["children"]:
            res += "\n" + get_uvl_text_rec(child, tabs + 2)
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
