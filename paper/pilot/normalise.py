"""Normalise the stacks of the pilot (resumen.csv) and count distinct stacks.

Level 1 (naming): every component is mapped to a canonical project name and a
stack is treated as a SET of components (framework + libraries), so order,
capitalisation, package-vs-project names and extras ("[standard]") are ignored.

Level 2 (requirement-relevant): level 1 minus AUXILIARY components that do not
address any stated requirement (servers, DB/broker drivers, HTTP clients,
migration tools, framework built-ins) or that are mandatory dependencies of
another listed component. The platform does not list these either.

Run after summarise.py. Writes normalizado.csv and prints the counts.
"""
import csv
import re
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).parent

# canonical name -> aliases (compared case-insensitively, extras removed)
ALIASES = {
    "Django": ["django"],
    "Django REST Framework": ["djangorestframework", "django rest framework"],
    "Django Channels": ["channels", "django channels"],
    "FastAPI": ["fastapi"],
    "FastAPI Users": ["fastapi-users"],
    "Ruby on Rails": ["ruby on rails", "ruby on rails (api mode)"],
    "Gin": ["gin", "github.com/gin-gonic/gin"],
    "Express": ["express"],
    "NestJS GraphQL": ["@nestjs/graphql"],
    "NestJS WebSockets": ["@nestjs/websockets", "@nestjs/platform-socket.io"],
    "Apollo Server": ["apollo server", "apollo-server", "@apollo/server", "apollo-server-express"],
    "Socket.IO": ["socket.io"],
    "Mongoose": ["mongoose"],
    "BullMQ": ["bullmq"],
    "MUI": ["mui", "material ui", "mui (material-ui)", "@mui/material"],
    "React Router": ["react router", "react-router-dom"],
    "Redux Toolkit": ["redux toolkit", "@reduxjs/toolkit"],
    "Zustand": ["zustand"],
    "TanStack Query": ["tanstack query", "tanstack query (react query)", "@tanstack/react-query"],
    "React Hook Form": ["react hook form", "react-hook-form"],
    "Zod": ["zod"],
    "Yup": ["yup"],
    "Capacitor": ["capacitor", "@capacitor/core"],
    "Ionic": ["ionic framework"],
    "Riverpod": ["riverpod", "flutter_riverpod"],
    "Hive": ["hive", "hive_flutter"],
    "Celery": ["celery"],
    "SQLAlchemy": ["sqlalchemy"],
    "Pydantic": ["pydantic"],
    "python-jose": ["python-jose"],
    "casbin": ["casbin", "python-casbin"],
    "Hibernate": ["hibernate", "hibernate orm"],
    "Spring Web": ["spring web", "spring-boot-starter-web"],
    "Spring Security": ["spring security", "spring-security", "spring-boot-starter-security"],
    "Spring Data Neo4j": ["spring data neo4j", "spring-data-neo4j", "spring-boot-starter-data-neo4j"],
    "Spring for Apache Kafka": ["spring for apache kafka", "spring kafka", "spring-kafka"],
    "mgm": ["mgm", "github.com/kamva/mgm"],
    "MongoDB Go Driver": ["mongodb go driver", "mongo-go-driver", "go.mongodb.org/mongo-driver"],
    "redis-py": ["redis", "redis-py"],
    "Uvicorn": ["uvicorn"],
    "Daphne": ["daphne"],
    "psycopg": ["psycopg", "psycopg2", "psycopg2-binary"],
}

# frameworks that are really framework + library
SPLIT = {"ionic react": ["React", "Ionic"]}

# Level 2: components removed because they address no stated requirement
AUXILIARY = {
    "Uvicorn", "Daphne",                       # ASGI servers
    "psycopg", "asyncpg",                      # PostgreSQL drivers
    "pika", "amqp", "boto3",                   # broker / cloud clients used by Celery
    "redis-py", "redis-rb", "redis-rails", "aioredis",  # Redis clients
    "channels-redis",                          # Channels layer backend
    "Axios",                                   # HTTP client
    "alembic",                                 # migrations
    "graphql",                                 # peer dependency of Apollo
    "@emotion/react", "@emotion/styled",       # peer dependencies of MUI
    "react-redux",                             # binding of Redux Toolkit
    "i18next",                                 # peer dependency of react-i18next
    "@nestjs/mongoose",                        # integration of Mongoose
    "django.contrib.admin", "django.contrib.auth",  # Django built-ins
    "Action Cable",                            # Rails built-in (WebSockets)
    "Pydantic", "websockets",                  # FastAPI deps (see REQUIRED_IN)
    "Spring Web",                              # starter for REST (part of Spring Boot)
    "Hibernate",                               # default JPA provider of Spring Data JPA
    "MongoDB Go Driver",                       # driver below the ODM
}
# Level 2 exceptions: keep the component if it is the ONLY one covering a need
KEEP_IF_ALONE = {"MongoDB Go Driver"}

# Auxiliary components that DO count when the scenario explicitly states the
# requirement they cover (real-time communication, declarative validation).
REQUIRED_IN = {
    "websockets": {"S1", "S2", "H1", "H2", "H4", "P1a", "P1b", "P1c"},
    "Pydantic": {"H1"},
}

LOOKUP = {a: canon for canon, aliases in ALIASES.items() for a in aliases}


def canon(name):
    n = re.sub(r"\[.*?\]", "", name).strip()
    if n.lower() in ("", "none", "-"):
        return []
    if n.lower() in SPLIT:
        return SPLIT[n.lower()]
    return [LOOKUP.get(n.lower(), n)]


def is_auxiliary(c, scenario, l1):
    if c in REQUIRED_IN and scenario in REQUIRED_IN[c]:
        return False
    if c in KEEP_IF_ALONE and not ({"mgm", "Qmgo"} & l1):
        return False
    return c in AUXILIARY


def stack_sets(row):
    comps = canon(row["framework"])
    for lib in row["libraries"].split(";"):
        comps += canon(lib)
    l1 = frozenset(comps)
    l2 = frozenset(c for c in l1 if not is_auxiliary(c, row["scenario"], l1))
    fw = canon(row["framework"])
    return (fw[0] if fw else "(none)"), l1, l2


def main():
    rows = list(csv.DictReader(open(HERE / "resumen.csv", encoding="utf-8")))
    out = []
    groups = defaultdict(list)
    for r in rows:
        fw, l1, l2 = stack_sets(r)
        out.append({**r, "fw_norm": fw,
                    "stack_l1": " + ".join(sorted(l1)),
                    "stack_l2": " + ".join(sorted(l2))})
        groups[r["scenario"]].append((r["model"], fw, l1, l2))
        if r["scenario"].startswith("P1"):
            groups["P1 (all)"].append((r["model"], fw, l1, l2))

    with open(HERE / "normalizado.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=out[0].keys())
        w.writeheader()
        w.writerows(out)

    print(f"{'scenario':10} {'n':>3} {'fw':>3} {'L1':>3} {'L2':>3}  frameworks")
    for s in sorted(groups, key=lambda k: (k[0], k)):
        g = groups[s]
        fws = defaultdict(int)
        for _, fw, _, _ in g:
            fws[fw] += 1
        print(f"{s:10} {len(g):>3} {len(fws):>3} {len({x[2] for x in g}):>3} "
              f"{len({x[3] for x in g}):>3}  {dict(fws)}")

    print("\nPer model (distinct L2 stacks over its 3 runs, or 9 for P1 all):")
    for s in sorted(groups, key=lambda k: (k[0], k)):
        per = defaultdict(set)
        for m, _, _, l2 in groups[s]:
            per[m].add(l2)
        print(f"{s:10} " + "  ".join(f"{m.replace('gemini-', '')}={len(v)}" for m, v in sorted(per.items())))


if __name__ == "__main__":
    main()
