import json

from configurador.serializers import UVLModelSerializer
from configurador.test.base import BaseUVLTestCase, EXPECTED_MODEL_DICT


class UVLModelSerializerTests(BaseUVLTestCase):
    def get_model_copy(self):
        return json.loads(json.dumps(EXPECTED_MODEL_DICT))

    def get_backend_node(self, model):
        return next(
            child
            for relation in model["relations"]
            for child in relation["children"]
            if child["name"] == "Backend"
        )

    def test_uvl_model_serializer_applies_nested_defaults_when_fields_are_omitted(self):
        new_model = self.get_model_copy()
        backend_node = self.get_backend_node(new_model)
        orm_node = next(
            child
            for relation in backend_node["relations"]
            for child in relation["children"]
            if child["name"] == "ORM-01"
        )
        orm_node.pop("attributes")
        orm_node.pop("relations")

        serializer = UVLModelSerializer(data=new_model)

        self.assertTrue(serializer.is_valid(), serializer.errors)
        validated_backend_node = self.get_backend_node(serializer.validated_data)
        validated_orm_node = next(
            child
            for relation in validated_backend_node["relations"]
            for child in relation["children"]
            if child["name"] == "ORM-01"
        )
        self.assertEqual(validated_orm_node["attributes"], {})
        self.assertEqual(validated_orm_node["relations"], [])

    def test_uvl_model_serializer_should_not_allow_new_relation_in_first_level(self):
        new_model = self.get_model_copy()
        new_model["relations"].append(
            {
                "type": "OPTIONAL",
                "children": [
                    {"name": "New feature", "relations": [], "attributes": {}}
                ],
            }
        )

        serializer = UVLModelSerializer(data=new_model)

        self.assertFalse(serializer.is_valid())
        self.assertIn("relations", serializer.errors)
        self.assertIn(
            "El primer nivel solo debe de tener una relación alternativa",
            str(serializer.errors["relations"][0]),
        )

    def test_uvl_model_serializer_should_not_allow_replacing_root_alternative_relation(self):
        new_model = self.get_model_copy()
        new_model["relations"][0]["type"] = "MANDATORY"

        serializer = UVLModelSerializer(data=new_model)

        self.assertFalse(serializer.is_valid())
        self.assertIn("relations", serializer.errors)
        self.assertIn(
            "La primera relación del nodo raíz debe ser 'ALTERNATIVE'.",
            str(serializer.errors["relations"][0]),
        )

    def test_uvl_model_serializer_should_not_allow_adding_and_removing_root_children(self):
        new_model = self.get_model_copy()
        root_children = new_model["relations"][0]["children"]
        removed_child = root_children.pop()["name"]
        root_children.append(
            {"name": "New feature", "relations": [], "attributes": {}}
        )

        serializer = UVLModelSerializer(data=new_model)

        self.assertFalse(serializer.is_valid())
        self.assertIn("relations", serializer.errors)
        error_message = str(serializer.errors["relations"][0])
        self.assertIn("Los hijos del nodo raíz no son válidos.", error_message)
        self.assertIn(f"Faltan: {removed_child}.", error_message)
        self.assertIn("No permitidos aquí: New feature.", error_message)
