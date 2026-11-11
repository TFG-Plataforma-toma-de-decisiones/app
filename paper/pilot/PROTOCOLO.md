# Pilot study (Study 1, RQ1) — protocol

Goal: compare the stacks recommended by general-purpose LLMs (via their chat
interfaces) with the ones returned by the platform for the same 8 scenarios.

## Setup (write it down once per model)

- Model and exact version shown in the interface (e.g., "GPT-5", "Claude Opus 5.5", "Gemini 3 Pro").
- Date of the runs.
- Memory/personalisation **disabled** and no custom instructions.
- Web search: **disabled** if the interface allows it; otherwise note that it was on.

## Procedure

1. For each model and scenario, open a **new chat** (no previous context).
2. Paste the common instruction followed by the scenario text (see `prompts.md`), exactly as written.
3. Copy the full answer into `respuestas/<model>_<scenario>_run<k>.md`.
4. Repeat 3 times per scenario (3 new chats) to measure consistency.
   - 8 scenarios x 3 runs = 24 chats per model.
5. Fill in one row per answer in `resultados.csv`.

## How to judge each answer (columns of resultados.csv)

- `framework`, `libraries`: as proposed by the LLM.
- `nonexistent`: number of proposed components that do not exist
  (check npm / PyPI / Maven Central / pkg.go.dev).
- `reqs_total`, `reqs_covered`: requirements of the scenario and how many are
  really covered by the stack, according to the **official documentation**
  (not according to our catalogue). A requirement covered only by "you can
  implement it yourself" counts as NOT covered.
- `incompatible`: number of components that do not work with the chosen
  framework or language (e.g., a React-only library proposed for Vue).
- `contradiction_detected` (S8 only): yes / no / partial
  (partial = mentions the tension but still proposes a stack without asking).
- `notes`: anything interesting (extra unrequested components, deprecated
  projects, wrong claims about a component, etc.).

Consistency is computed afterwards: whether the 3 runs of the same scenario
propose the same framework.

Apply the same criteria (official documentation) to the platform's
recommendations in `resultados_plataforma.csv`, so that both are judged
in the same way.
