"""Retrospective check against real open-source web applications.

Sample: the ten most-starred client-server web applications in the GitHub
search `topic:self-hosted` (2026-11-06). Skipped while going down the ranking:
awesome-selfhosted (a list), unslothai/unsloth (mainly a machine learning
library with a local UI) and pathwaycom/serviette (a service without a web
client). Capabilities come from the projects' manifests (package.json,
requirements.txt, go.mod, composer.json, build.gradle).

Each capability is (feature of the model or None if it cannot be expressed,
evidence in the manifest).

Usage: python real_projects.py <fixtures_dir> <out_dir>
"""
import json
import sys
from pathlib import Path

from flamapy.interfaces.python.flamapy_feature_model import FLAMAFeatureModel

from evaluate import SCENARIOS, base, load_catalogue, recommend

FE_SPA = [("Web", "web client"), ("SPA", "single-page client")]

APPS = {
    "n8n": {"Backend": ("JavaScript/TypeScript", "Express.js", [
                ("REST", "express"), ("JWT", "jsonwebtoken"), ("ORM-1", "@n8n/typeorm"),
                ("RedisQueue", "bull"), ("Redis-1", "ioredis"), ("RequestValidation", "class-validator"),
                ("OpenAPIDocumentationSupport", "swagger-ui-express"), ("WebSockets", "ws")]),
            "Frontend": ("JavaScript/TypeScript", "Vue.js", FE_SPA + [
                ("ClientSideRouting", "vue-router"), ("GlobalState-2", "pinia"),
                ("i18nInternationalization-2", "vue-i18n")])},
    "open-webui": {"Backend": ("Python", "FastAPI", [
                ("REST", "fastapi"), ("JWT", "PyJWT"), ("OAuth2", "authlib"), ("ORM-1", "sqlalchemy"),
                ("WebSockets", "python-socketio"), ("SchemaValidation", "pydantic"),
                ("OpenAPIDocumentationSupport", "fastapi")]),
            "Frontend": ("JavaScript/TypeScript", "Svelte", FE_SPA + [
                ("FileBasedRouting", "@sveltejs/kit"), ("i18nInternationalization-2", "i18next")])},
    "immich": {"Backend": ("JavaScript/TypeScript", "NestJS", [
                ("REST", "@nestjs/core"), ("JWT", "jsonwebtoken"), ("OAuth2", "openid-client"),
                ("SchemaValidation", "zod"), ("WebSockets", "@nestjs/websockets"), ("RedisQueue", "bullmq"),
                ("OpenAPIDocumentationSupport", "@nestjs/swagger"), (None, "kysely (query builder)")]),
            "Frontend": ("JavaScript/TypeScript", "Svelte", [
                ("Web", "web client"), ("FileBasedRouting", "@sveltejs/kit"),
                ("QueryCaching", "@tanstack/svelte-query"), ("i18nInternationalization-2", "svelte-i18n")])},
    "Stirling-PDF": {"Backend": ("Java", "Spring Boot", [
                ("REST", "spring-boot"), ("JWT", "jjwt"), ("OAuth2", "starter-security-oauth2-client"),
                ("ORM-1", "starter-data-jpa"), ("OpenAPIDocumentationSupport", "springdoc"),
                (None, "SAML (spring-security-saml2)")]),
            "Frontend": ("JavaScript/TypeScript", "React", FE_SPA + [
                ("ClientSideRouting", "react-router-dom"), ("QueryCaching", "@tanstack/react-query"),
                ("i18nInternationalization-2", "react-i18next")])},
    "uptime-kuma": {"Backend": ("JavaScript/TypeScript", "Express.js", [
                ("REST", "express"), ("WebSockets", "socket.io"), ("ORM-1", "redbean-node"),
                ("SchemaValidation", "zod")]),
            "Frontend": ("JavaScript/TypeScript", "Vue.js", FE_SPA + [
                ("ClientSideRouting", "vue-router"), ("i18nInternationalization-2", "vue-i18n")])},
    "coolify": {"Full Stack": ("PHP", "Laravel", [
                ("SSR-3", "livewire/livewire"), ("ORM-3", "laravel/framework"),
                ("AuthenticationBuiltIn", "laravel/fortify"), ("WebSockets-3", "laravel/reverb"),
                ("RedisQueue-5", "laravel/horizon"), (None, "OAuth login (laravel/socialite)"),
                (None, "API docs (zircote/swagger-php)")])},
    "memos": {"Backend": ("Go", "(gRPC gateway, no framework)", [
                ("gRPC", "google.golang.org/grpc"), ("REST", "grpc-gateway"), ("JWT", "golang-jwt")]),
            "Frontend": ("JavaScript/TypeScript", "React", FE_SPA + [
                ("ClientSideRouting", "react-router-dom"), ("QueryCaching", "@tanstack/react-query"),
                ("i18nInternationalization-2", "react-i18next")])},
    "gitea": {"Backend": ("Go", "chi", [
                ("REST", "go-chi/chi"), ("JWT", "golang-jwt"), ("ORM-1", "xorm"), ("Redis-1", "go-redis")])},
    "appwrite": {"Backend": ("PHP", "Utopia", [("REST", "utopia-php")])},
    "new-api": {"Backend": ("Go", "Gin", [
                ("REST", "gin-gonic/gin"), ("JWT", "golang-jwt"), ("ORM-1", "gorm"), ("Redis-1", "go-redis"),
                ("WebSockets", "gorilla/websocket")]),
            "Frontend": ("JavaScript/TypeScript", "React", FE_SPA + [
                ("ClientSideRouting", "@tanstack/react-router"), ("FormStateManagement", "react-hook-form"),
                ("Validation", "zod"), ("QueryCaching", "@tanstack/react-query"), ("GlobalState-2", "zustand"),
                ("i18nInternationalization-2", "react-i18next")])},
}


def subtree(feature):
    names = {feature.name}
    for rel in feature.get_relations():
        for child in rel.children:
            names |= subtree(child)
    return names


def questions(fm):
    """First-level questions of each branch: the direct children of its node."""
    result = {}
    for rel in fm.root.get_relations():
        for branch in rel.children:
            result[branch.name] = [subtree(c) for r in branch.get_relations() for c in r.children]
    return result


def touched(features, branch_questions):
    return sum(1 for q in branch_questions if set(features) & q)


def main():
    fixtures, out = Path(sys.argv[1]), Path(sys.argv[2])
    fm = FLAMAFeatureModel(str(fixtures / "model.uvl")).fm_model
    qs = questions(fm)
    projects = load_catalogue(fixtures / "datos.json")
    names = {p.name for p in projects}

    rows = []
    for app, branches in APPS.items():
        for kind, (language, real, caps) in branches.items():
            feats = [f for f, _ in caps if f]
            result = recommend({kind: ([language], feats)}, projects)
            frameworks = sorted({r["project"] for r in result})
            # greedy diagnosis: which requirements stop the real framework?
            blockers = [f for f in feats
                        if real in names and real not in
                        {r["project"] for r in recommend({kind: ([language], [f])}, projects)}]
            rows.append({"app": app, "branch": kind, "language": language, "real": real,
                         "real_in_catalogue": real in names, "capabilities": len(caps),
                         "expressible": len(feats), "not_expressible": [e for f, e in caps if not f],
                         "returned": frameworks, "real_returned": real in frameworks,
                         "blockers": blockers, "questions": len(qs[kind]),
                         "questions_touched": touched(feats, qs[kind]),
                         "stacks": result})

    scenario_rows = []
    for name, branches in SCENARIOS.items():
        if name in ("P1a", "P1b", "P1c", "S8"):
            continue
        for kind, (_, feats) in branches.items():
            scenario_rows.append({"scenario": name, "branch": kind, "questions": len(qs[kind]),
                                  "questions_touched": touched(feats, qs[kind])})

    report = {"questions_per_branch": {k: len(v) for k, v in qs.items()},
              "apps": rows, "scenarios": scenario_rows}
    (out / "resultados_proyectos_reales.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

    print(report["questions_per_branch"])
    for r in rows:
        print(f'{r["app"]:13}{r["branch"]:11}real={r["real"]:12} incat={r["real_in_catalogue"]!s:6}'
              f'expr={r["expressible"]}/{r["capabilities"]} got={r["real_returned"]!s:6}'
              f'q={r["questions_touched"]}/{r["questions"]} block={r["blockers"]} returned={r["returned"]}')
    print("capabilities", sum(r["capabilities"] for r in rows), "expressible", sum(r["expressible"] for r in rows))
    inc = [r for r in rows if r["real_in_catalogue"]]
    print("rows", len(rows), "in catalogue", len(inc), "returned", sum(r["real_returned"] for r in inc))
    for r in scenario_rows:
        print(r["scenario"], r["branch"], f'{r["questions_touched"]}/{r["questions"]}')


if __name__ == "__main__":
    main()
