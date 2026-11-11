"""Pilot (Study 1): run the 8 scenarios against the Gemini API.

The API key is read from the backend .env (GEMINI_API_KEY) and only sent in
the x-goog-api-key header; it is never printed or written to disk.

Usage: python run_gemini.py [--models m1,m2] [--runs N] [--list-models]
"""
import argparse
import datetime
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).parent
ENV_FILE = HERE.parents[1] / "backend" / ".env"
API = "https://generativelanguage.googleapis.com/v1beta"


def load_key():
    # The key is read from the GEMINI_API_KEY environment variable or, if it is
    # not set, from backend/.env. It is never printed or stored.
    if os.environ.get("GEMINI_API_KEY"):
        return os.environ["GEMINI_API_KEY"]
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        if line.strip().startswith("GEMINI_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("GEMINI_API_KEY not found in .env")


def call(url, key, body=None):
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"x-goog-api-key": key, "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        # Only the response body is shown (it never contains the key).
        return {"error": e.code, "body": e.read().decode(errors="replace")[:500]}
    except (TimeoutError, urllib.error.URLError) as e:
        return {"error": "timeout", "body": str(e)[:200]}


def load_prompts(name):
    text = (HERE / name).read_text(encoding="utf-8")
    blocks = re.findall(r"```\n(.*?)```", text, flags=re.S)
    ids = re.findall(r"^\*\*([A-Z]\d\w*)\*\*", text, flags=re.M)
    return blocks[0], dict(zip(ids, blocks[1:1 + len(ids)]))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--models", default="gemini-2.5-flash,gemini-2.5-pro")
    ap.add_argument("--runs", type=int, default=3)
    ap.add_argument("--only", default="", help="comma-separated scenario ids")
    ap.add_argument("--list-models", action="store_true")
    ap.add_argument("--prompts", default="prompts.md")
    ap.add_argument("--instruction", default="", help="file replacing the common instruction")
    ap.add_argument("--out", default="respuestas", help="output folder")
    ap.add_argument("--skip-existing", action="store_true")
    args = ap.parse_args()
    key = load_key()

    if args.list_models:
        res = call(f"{API}/models?pageSize=200", key)
        for m in res.get("models", []):
            if "generateContent" in m.get("supportedGenerationMethods", []):
                print(m["name"])
        return

    instruction, scenarios = load_prompts(args.prompts)
    if args.instruction:
        instruction = (HERE / args.instruction).read_text(encoding="utf-8")
    if args.only:
        scenarios = {k: v for k, v in scenarios.items() if k in args.only.split(",")}
    out_dir = HERE / args.out
    out_dir.mkdir(exist_ok=True)
    today = datetime.date.today().isoformat()

    for model in args.models.split(","):
        for sid, scenario in scenarios.items():
            for run in range(1, args.runs + 1):
                # Default generation settings, as a developer using the API would.
                path = out_dir / f"{model}_{sid}_run{run}.json"
                if args.skip_existing and path.exists():
                    continue
                body = {"contents": [{"role": "user", "parts": [{"text": instruction + scenario}]}]}
                for attempt in range(3):  # retry on timeouts / transient errors
                    res = call(f"{API}/models/{model}:generateContent", key, body)
                    if res.get("error") not in ("timeout", 429, 500, 503):
                        break
                if "error" in res:
                    text = f"ERROR {res['error']}: {res['body']}"
                else:
                    parts = res["candidates"][0]["content"].get("parts", [])
                    text = "".join(p.get("text", "") for p in parts)
                record = {
                    "model": model,
                    "model_version": res.get("modelVersion"),
                    "date": today,
                    "scenario": sid,
                    "run": run,
                    "prompt": instruction + scenario,
                    "answer": text,
                }
                path.write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding="utf-8")
                print(f"{model} {sid} run{run}: {'ERROR' if text.startswith('ERROR') else 'ok'}")


if __name__ == "__main__":
    main()
