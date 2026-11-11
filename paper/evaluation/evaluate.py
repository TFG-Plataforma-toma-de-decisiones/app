"""Offline evaluation of the platform (no Django, no database, no LLM).

Reads the same model.uvl and datos.json used by the backend. The function
`recommend` is a line-by-line port of `get_recommendation`
(configurador/views.py) and `validate` of FlamapyService.validate.

Usage: python evaluate.py <fixtures_dir> <out_dir>
"""
import hashlib
import json
import statistics
import sys
import time
from pathlib import Path

from flamapy.interfaces.python.flamapy_feature_model import FLAMAFeatureModel
from flamapy.metamodels.configuration_metamodel.models.configuration import Configuration
from flamapy.metamodels.pysat_metamodel.operations import PySATSatisfiableConfiguration

REPETITIONS = 100

S1 = {"Backend": (["Python"], ["REST", "ORM-1", "JWT", "RabbitMQ", "WebSockets"])}
SCENARIOS = {
    "S1": S1,
    "S2": {"Backend": (["JavaScript/TypeScript"], ["GraphQL", "ODM-1", "WebSockets", "RedisQueue"])},
    "S3": {"Frontend": (["JavaScript/TypeScript"], ["Web", "SPA", "ClientSideRouting", "GlobalState-2",
                                                    "i18nInternationalization-2", "ThemingSupport-2"])},
    "S4": {"Frontend": ([], ["Mobile", "FormStateManagement", "Validation", "QueryCaching"])},
    "S6": {"Backend": (["Java"], ["REST", "Kafka", "OGM-1", "DependencyInjection", "Roles"])},
    "S7": {"Backend": (["Go"], ["REST", "ODM-1"])},
    "S8": {"Frontend": ([], ["Web", "SPA", "MPA"])},
    "H1": {"Backend": (["Python"], ["REST", "ORM-1", "JWT", "OAuth2", "Roles", "Permissions",
                                    "RequestValidation", "SchemaValidation", "OpenAPIDocumentationSupport",
                                    "Redis-1", "Memcached-1", "RabbitMQ", "AWSSQS", "WebSockets",
                                    "GenericCRUDAbstractions"])},
    "H2": {"Backend": ([], ["REST", "BSD-1", "JWT", "WebSockets"])},
    "H2b": {"Backend": ([], ["REST", "Apache-1", "ORM-1", "RabbitMQ"])},
    "H3": {"Frontend": ([], ["Web+Mobile", "OfflineSupport", "InstallableApp", "i18nInternationalization-2",
                             "GlobalState-2", "Validation"])},
    "H5": {"Backend": (["Ruby"], ["REST", "ODM-1", "RedisQueue"]),
           "Frontend": ([], ["Mobile", "GlobalState-2", "i18nInternationalization-2"])},
    # P1a-c are paraphrases of S1: their configuration is the same one.
    "P1a": S1, "P1b": S1, "P1c": S1,
}


def base(features):
    return {f.split("-")[0] for f in features}


class Project:
    def __init__(self, pk, fields, languages):
        self.pk = pk
        self.name = fields["name"]
        self.language_id = fields["language"]
        self.language = languages[fields["language"]]
        f = fields["features"]
        self.features = json.loads(f) if isinstance(f, str) else f
        self.compatible = set(fields.get("compatible_projects") or [])


def load_catalogue(path):
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    languages = {d["pk"]: d["fields"]["name"] for d in data if d["model"] == "configurador.language"}
    return [Project(d["pk"], d["fields"], languages) for d in data if d["model"] == "configurador.project"]


def recommend(branches, projects):
    libraries_by_type = {
        "Frontend": [p for p in projects if "Frontend Library" in p.features],
        "Backend": [p for p in projects if "Backend Library" in p.features],
        "Full Stack": [p for p in projects if "Backend Library" in p.features or "Frontend Library" in p.features],
    }
    result = []
    for kind, (languages, features) in branches.items():
        requested = base(features + [kind])
        for project in projects:
            if kind not in project.features or (languages and project.language not in languages):
                continue
            covered = base(project.features)
            used = []
            while missing := requested - covered:
                options = [(p, base(p.features) & missing) for p in libraries_by_type[kind]
                           if p.language_id == project.language_id]
                options = [(p, c) for p, c in options if c and (project.pk in p.compatible or not p.compatible)]
                options.sort(key=lambda o: (project.pk in o[0].compatible, len(o[1])), reverse=True)
                if not options:
                    break
                covered |= base(options[0][0].features)
                used.append(options[0][0].name)
            if not missing:
                result.append({"type": kind, "project": project.name, "libraries": used})
    return sorted(result, key=lambda r: len(r["libraries"]))


def check_stack(stack, branches, by_name):
    """Independent oracle: coverage and compatibility of a returned stack."""
    languages, features = branches[stack["type"]]
    main = by_name[stack["project"]]
    libs = [by_name[n] for n in stack["libraries"]]
    provided = base(main.features)
    for lib in libs:
        provided |= base(lib.features)
    return {
        "covers": base(features) <= provided,
        "kind": stack["type"] in main.features,
        "language": (not languages or main.language in languages)
                    and all(l.language_id == main.language_id for l in libs),
        "compatible": all(not l.compatible or main.pk in l.compatible for l in libs),
    }


def count_configs(feature):
    """Exact number of configurations of the subtree (valid: no cross-tree constraints)."""
    total = 1
    for rel in feature.get_relations():
        counts = [count_configs(c) for c in rel.children]
        if rel.is_mandatory():
            value = counts[0]
        elif rel.is_optional():
            value = counts[0] + 1
        elif rel.is_alternative():
            value = sum(counts)
        else:  # or
            value = 1
            for c in counts:
                value *= c + 1
            value -= 1
        total *= value
    return total


def walk(feature, depth=0):
    yield feature, depth
    for rel in feature.get_relations():
        for child in rel.children:
            yield from walk(child, depth + 1)


def model_metrics(fm):
    root = fm.root
    nodes = list(walk(root))
    rels = [r for f, _ in nodes for r in f.get_relations()]
    kinds = {"mandatory": 0, "optional": 0, "alternative": 0, "or": 0}
    for r in rels:
        kinds["mandatory" if r.is_mandatory() else "optional" if r.is_optional()
              else "alternative" if r.is_alternative() else "or"] += 1
    leaves = [f for f, _ in nodes if not f.get_relations()]
    depths = [d for f, d in nodes if not f.get_relations()]
    branches = {}
    for rel in root.get_relations():
        for child in rel.children:
            sub = list(walk(child))
            opt = sum(1 for f, _ in sub for r in f.get_relations() if r.is_optional())
            grp = sum(1 for f, _ in sub for r in f.get_relations() if r.is_alternative() or r.is_or())
            branches[child.name] = {"features": len(sub), "optional": opt, "groups": grp,
                                    "decision_points": opt + grp,
                                    "configurations": str(count_configs(child))}
    total = count_configs(root)
    return {"features": len(nodes), "leaves": len(leaves), "max_depth": max(d for _, d in nodes),
            "mean_leaf_depth": round(statistics.mean(depths), 2), "relations": kinds,
            "cross_tree_constraints": len(fm.get_constraints()),
            "configurations": str(total), "configurations_sci": f"{total:.3e}", "branches": branches}


def main():
    fixtures, out = Path(sys.argv[1]), Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    flama = FLAMAFeatureModel(str(fixtures / "model.uvl"))
    flama._transform_to_sat()
    metrics = model_metrics(flama.fm_model)
    projects = load_catalogue(fixtures / "datos.json")
    by_name = {p.name: p for p in projects}

    def validate(features, full):
        op = PySATSatisfiableConfiguration()
        conf = Configuration(elements={f: True for f in features})
        conf.set_full(full)
        op.set_configuration(conf)
        try:
            op.execute(flama.sat_model)
            return bool(op.get_result())
        except KeyError:
            return False

    invalid = [p.name for p in projects if not validate(p.features, True)]
    catalogue = {"projects": len(projects),
                 "frameworks": sum(1 for p in projects if not {"Backend Library", "Frontend Library"} & set(p.features)),
                 "libraries": sum(1 for p in projects if {"Backend Library", "Frontend Library"} & set(p.features)),
                 "languages": len({p.language for p in projects}),
                 "invalid_annotations": invalid,
                 "libraries_with_links": sum(1 for p in projects if p.compatible)}

    rows = {}
    for name, branches in SCENARIOS.items():
        valid = all(validate(f + [k], False) for k, (_, f) in branches.items())
        t_sat, t_rec, digests = [], [], set()
        stacks = []
        for _ in range(REPETITIONS):
            a = time.perf_counter()
            for k, (_, f) in branches.items():
                validate(f + [k], False)
            b = time.perf_counter()
            stacks = recommend(branches, projects) if valid else []
            c = time.perf_counter()
            t_sat.append((b - a) * 1000)
            t_rec.append((c - b) * 1000)
            digests.add(hashlib.sha256(json.dumps(stacks, sort_keys=True).encode()).hexdigest())
        checks = [check_stack(s, branches, by_name) for s in stacks]
        rows[name] = {"sat_valid": valid, "stacks": stacks, "n_stacks": len(stacks),
                      "requested": sum(len(f) for _, f in branches.values()),
                      "all_checks_pass": all(all(c.values()) for c in checks),
                      "distinct_outputs": len(digests),
                      "sat_ms_median": round(statistics.median(t_sat), 3),
                      "match_ms_median": round(statistics.median(t_rec), 3)}

    report = {"model": metrics, "catalogue": catalogue, "repetitions": REPETITIONS, "scenarios": rows}
    (out / "resultados_evaluacion.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps({"model": metrics, "catalogue": catalogue}, indent=1, ensure_ascii=False))
    for n, r in rows.items():
        print(n, "sat", r["sat_valid"], "n", r["n_stacks"], "ok", r["all_checks_pass"], "outs", r["distinct_outputs"],
              "sat_ms", r["sat_ms_median"], "match_ms", r["match_ms_median"],
              [s["project"] + "+" + "+".join(s["libraries"]) for s in r["stacks"]])


if __name__ == "__main__":
    main()
