"""Analyse the multi-stack run (respuestas_multi/*.json).

The prompt asked for every suitable stack, so each answer is a SET of
options. Names are normalised with normalise.py (canonical names; the main
framework identifies an option). Per scenario we report:
  - options per answer (mean, min-max)
  - Jaccard similarity of the framework sets between runs of the same model
    (mean over the 3 pairs, then over models)
  - number of different frameworks over all 9 answers
  - coverage of the platform's options: share of the platform's frameworks
    that appear in each answer (mean)
Writes multi_resumen.csv.
"""
import csv
import json
import re
from collections import defaultdict
from itertools import combinations
from pathlib import Path

from normalise import canon

HERE = Path(__file__).parent

# Main frameworks returned by the platform (REST API, 2026-10-12)
PLATFORM = {
    "S1": {"Django REST Framework", "Flask"}, "S2": {"NestJS"}, "S3": {"React"},
    "S4": {"React Native"}, "S5": {"Django", "Laravel"}, "S6": {"Spring Boot"},
    "S7": set(), "S8": set(),
    "H1": {"Django REST Framework"}, "H2": {"Flask", "Django REST Framework"},
    "H2b": {"Spring Boot"}, "H3": {"Expo"}, "H4": {"Laravel"},
    "H5": {"Ruby on Rails"},
    "P1a": {"Django REST Framework", "Flask"}, "P1b": {"Django REST Framework", "Flask"},
    "P1c": {"Django REST Framework", "Flask"},
}


# Framework-level aliases for this run (lower-case, parentheses removed first)
FW_ALIASES = {
    "express.js": "Express", "express": "Express",
    "github.com/gin-gonic/gin": "Gin", "github.com/labstack/echo/v4": "Echo",
    "gorilla mux": "Gorilla Mux", "gorilla/mux": "Gorilla Mux",
    "micronaut framework": "Micronaut", "yii 2": "Yii",
    "react native": "React Native",
}


def fw_name(raw):
    raw = (raw or "").strip()
    low = raw.lower()
    if "expo" in low:                       # "Expo (React Native)", "React Native (Expo)"
        return "Expo"
    if low.startswith("ionic"):             # Ionic with React / Vue / Angular
        return "Ionic"
    base = re.sub(r"\s*\(.*?\)", "", raw).strip()   # "(Java)", "(API mode)", ...
    return FW_ALIASES.get(base.lower(), base)


def frameworks(stack):
    fw = canon(fw_name(stack.get("framework")))
    if not fw:
        return None
    libs = {c for l in stack.get("libraries") or [] for c in canon(l)}
    # Django + DRF counts as DRF, as in the platform's catalogue
    if fw[0] == "Django" and "Django REST Framework" in libs:
        return "Django REST Framework"
    return fw[0]


def jaccard(a, b):
    return 1.0 if not a and not b else len(a & b) / len(a | b)


def main():
    data = defaultdict(lambda: defaultdict(dict))  # scenario -> model -> run -> set
    for f in sorted((HERE / "respuestas_multi").glob("*.json")):
        r = json.loads(f.read_text(encoding="utf-8"))
        m = re.search(r"\{.*\}", r["answer"], flags=re.S)
        try:
            a = json.loads(m.group(0)) if m else {}
        except json.JSONDecodeError:
            a = {}
        fws = {x for x in (frameworks(s) for s in a.get("stacks", []) or []) if x}
        data[r["scenario"]][r["model"]][r["run"]] = fws

    rows = []
    print(f"{'scen':5} {'opt/ans':>9} {'J(runs)':>8} {'#fw':>4} {'platf.cov':>9}  frameworks (count over 9 answers)")
    for s in sorted(data, key=lambda k: (k[0], k)):
        answers = [fs for runs in data[s].values() for fs in runs.values()]
        n_opts = [len(x) for x in answers]
        j = [jaccard(a, b) for runs in data[s].values()
             for a, b in combinations(list(runs.values()), 2)]
        count = defaultdict(int)
        for fs in answers:
            for x in fs:
                count[x] += 1
        plat = PLATFORM.get(s, set())
        cov = [len(fs & plat) / len(plat) for fs in answers] if plat else []
        row = {
            "scenario": s, "answers": len(answers),
            "options_mean": round(sum(n_opts) / len(n_opts), 1),
            "options_range": f"{min(n_opts)}-{max(n_opts)}",
            "jaccard_runs": round(sum(j) / len(j), 2) if j else "",
            "frameworks_total": len(count),
            "platform_coverage": round(sum(cov) / len(cov), 2) if cov else "",
            "frameworks": "; ".join(f"{k} ({v})" for k, v in sorted(count.items(), key=lambda x: -x[1])),
        }
        rows.append(row)
        print(f"{s:5} {row['options_mean']:>5} ({row['options_range']}) {row['jaccard_runs']!s:>8} "
              f"{row['frameworks_total']:>4} {row['platform_coverage']!s:>9}  {row['frameworks']}")

    # Paraphrases: same needs, three phrasings -> compare framework sets across phrasings per model
    print("\nParaphrases P1a-c, Jaccard between phrasings (same model, same run index):")
    for model in sorted(data.get("P1a", {})):
        js = []
        for run in (1, 2, 3):
            sets = [data[p][model].get(run, set()) for p in ("P1a", "P1b", "P1c")]
            js += [jaccard(a, b) for a, b in combinations(sets, 2)]
        print(f"  {model}: {sum(js) / len(js):.2f}")

    with open(HERE / "multi_resumen.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=rows[0].keys())
        w.writeheader()
        w.writerows(rows)


if __name__ == "__main__":
    main()
