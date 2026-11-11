"""Checks that the offline port returns exactly what the running platform returns."""
import json, urllib.request, urllib.error
BASE = "http://localhost:8000/api/v1/"

def post(branches):
    body = [{"type": k, "languages": l, "features": f} for k, (l, f) in branches.items()]
    req = urllib.request.Request(BASE + "recommend", json.dumps(body).encode(), {"Content-Type": "application/json"})
    try:
        return 200, json.load(urllib.request.urlopen(req, timeout=30))
    except urllib.error.HTTPError as e:
        return e.code, None

def norm(stacks):
    return sorted((s["type"], s["project"], tuple(s["libraries"])) for s in stacks or [])

ev = json.load(open("resultados_evaluacion.json", encoding="utf-8"))
rp = json.load(open("resultados_proyectos_reales.json", encoding="utf-8"))
import ast, re
src = open("evaluate.py", encoding="utf-8").read()
ns = {}
exec(src[src.index("S1 = {"):src.index("def base")], ns)
same = diff = 0
for name, branches in ns["SCENARIOS"].items():
    code, res = post(branches)
    off = ev["scenarios"][name]
    ok = (code == 400 and not off["sat_valid"]) or (code == 200 and norm(res) == norm(off["stacks"]))
    same += ok; diff += not ok
    if not ok: print("DIFF", name, code, norm(res), norm(off["stacks"]))
print("scenarios same", same, "diff", diff)
same = diff = 0
src2 = open("real_projects.py", encoding="utf-8").read()
ns2 = {}
exec(src2[src2.index("FE_SPA ="):src2.index("def subtree")], ns2)
for r in rp["apps"]:
    lang, real, caps = ns2["APPS"][r["app"]][r["branch"]]
    code, res = post({r["branch"]: ([lang], [f for f, _ in caps if f])})
    ok = code == 200 and norm(res) == norm(r["stacks"])
    same += ok; diff += not ok
    if not ok: print("DIFF", r["app"], r["branch"], code, norm(res), norm(r["stacks"]))
print("apps same", same, "diff", diff)
req = urllib.request.urlopen(BASE + "projects", timeout=30)
d = json.load(req)
print("projects in API:", len(d) if isinstance(d, list) else d.get("count"))
