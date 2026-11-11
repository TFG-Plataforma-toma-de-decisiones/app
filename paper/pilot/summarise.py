"""Summarise the pilot answers stored in respuestas/*.json into resumen.csv."""
import csv
import json
import re
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).parent
rows = []
for f in sorted((HERE / "respuestas").glob("*.json")):
    r = json.loads(f.read_text(encoding="utf-8"))
    m = re.search(r"\{.*\}", r["answer"], flags=re.S)
    try:
        a = json.loads(m.group(0)) if m else {}
    except json.JSONDecodeError:
        a = {}
    rows.append({
        "model": r["model"], "model_version": r.get("model_version"), "date": r["date"],
        "scenario": r["scenario"], "run": r["run"],
        "parsed": bool(a),
        "framework": a.get("framework", ""),
        "libraries": "; ".join(a.get("libraries", []) or []),
        "issues": (a.get("issues") or "").replace("\n", " "),
    })

with open(HERE / "resumen.csv", "w", newline="", encoding="utf-8") as fh:
    w = csv.DictWriter(fh, fieldnames=rows[0].keys())
    w.writeheader()
    w.writerows(rows)

# Console view: stacks per scenario and model, plus framework consistency
by = defaultdict(list)
for r in rows:
    by[(r["scenario"], r["model"])].append(r)
for (s, m), rs in sorted(by.items()):
    fw = {r["framework"] for r in rs}
    print(f"{s} | {m} | consistent={len(fw) == 1}")
    for r in sorted(rs, key=lambda x: x["run"]):
        issue = f"  [issues: {r['issues'][:120]}]" if r["issues"] else ""
        print(f"   run{r['run']}: {r['framework'] or '-'} + {r['libraries'] or '-'}{issue}")
