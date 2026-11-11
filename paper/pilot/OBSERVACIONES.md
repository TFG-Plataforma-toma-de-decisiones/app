# Pilot run 1 — Gemini API (2026-10-12)

Models: gemini-2.5-flash, gemini-3.8-flash, gemini-3.1-pro-preview.
Default generation settings, 8 scenarios x 3 runs = 72 answers (all parsed).
Raw answers: `respuestas/*.json`; table: `resumen.csv`.

First-pass judgement (to be checked against official documentation):

- Non-existent components: 1/72 answers. `github.com/shafreeck/mongoe`
  (gemini-2.5-flash, S7 run3) is not in the Go module proxy nor on GitHub.
- Requirement coverage / compatibility: no clear violation found in S1–S7.
- Contradiction (S8): detected in 9/9 answers (but the contradiction is
  written very explicitly in the prompt).
- Framework consistency across runs: 22/24 scenario-model pairs consistent.
  Inconsistent: gemini-3.1-pro-preview S2 (Express vs NestJS) and
  gemini-2.5-flash S7 (different ODM each run).
- Where the LLMs beat the platform:
  - S1: all models choose FastAPI + PyJWT/python-jose, which is valid; the
    platform discards FastAPI because JWT support is missing in the catalogue.
  - S7: all models propose Gin + an ODM (mgm, Qmgo); the platform returns
    nothing (no Go framework in the catalogue).
- The platform returns every valid stack; the LLMs were asked for one, so
  not mentioning alternatives (e.g. Laravel) is expected, not a finding.

# Pilot run 2 — harder scenarios and paraphrases (2026-10-12)

Same 3 models, `prompts_hard.md`, 9 scenarios x 3 runs = 81 answers (all parsed).

- Variability grows with complexity. Distinct stacks out of 9 answers
  (3 models x 3 runs; inflated by naming variants such as "channels" vs
  "Django Channels", to be normalised by hand): H1 9, H3 9, H4 8, H2b 6, H2 4, H5 2.
  - H3 (single codebase web+mobile): React+Capacitor/Ionic, React Native Web,
    Expo and Flutter.
  - H4: Django (7) vs Rails (2); Laravel (the platform's answer) never appears.
  - H2: Flask (5) vs Django (4).
- Paraphrases P1a–c (same requirements as S1, 27 answers): FastAPI in 26,
  Django in 1 (gemini-2.5-flash, P1c); 13 distinct full stacks. The Pro and
  3.8-flash models are stable on the framework; libraries vary.
- Non-existent packages (gemini-2.5-flash): `python-memcache` (real:
  python-memcached), `fastapi-authjwt` (real: fastapi-jwt-auth).
  Total across both runs: 3 / 153 answers.
- Partially covered requirements acknowledged by the LLM itself: 2 answers
  (H1 roles via "custom dependency", H3 offline via Workbox).
- Catalogue error found: the catalogue states that Flask supports JWT and
  WebSockets natively; the LLMs correctly add Flask-JWT-Extended and
  Flask-SocketIO.
- No answer presents more than one stack -- EXPECTED: the prompt asks for ONE
  stack, so this is NOT a finding (do not report it).

# Normalisation (2026-10-13) — `normalise.py`, output `normalizado.csv`

Level 1 = canonical names, stack as a set. Level 2 = level 1 minus auxiliary
components (servers, drivers, clients, built-ins, mandatory dependencies; see
the AUXILIARY list in the script). Distinct stacks per scenario (9 answers):

| Scen. | frameworks | L1 | L2 |
|---|---|---|---|
| S1 | 1 | 6 | 4 |  S2 | 2 | 7 | 7 |
| S3 | 1 | 4 | 3 |  S4 | 1 | 3 | 2 |
| S5 | 1 | 3 | 1 |  S6 | 1 | 2 | 1 |
| S7 | 1 | 5 | 3 |  S8 | - | 1 | 1 |
| H1 | 2 | 9 | 9 |  H2 | 2 | 3 | 2 |
| H2b | 1 | 4 | 2 | H3 | 4 | 8 | 8 |
| H4 | 2 | 7 | 3 |  H5 | 1 | 2 | 1 |
| P1a–c (27) | 2 | 13 | 6 |

The figure "13 distinct stacks" used earlier was level 1; the article now
reports level 2 (6 stacks, 2 frameworks). Laravel never appears in H4.

Rule (agreed 2026-10-13): Pydantic and websockets are auxiliary only when the
scenario does not state the requirement they cover (REQUIRED_IN in the script).

# Pilot run 3 — "every suitable stack" (2026-10-13)

Instruction: `instruccion_multi.txt` (no limit on the number of stacks).
17 scenarios x 3 models x 3 runs = 153 answers in `respuestas_multi/`, all
parsed. Analysis: `analyse_multi.py` -> `multi_resumen.csv`. Framework names
normalised (Ionic variants grouped as "Ionic"; Expo variants as "Expo").

- Options per answer: 2-3 on average (S8: 0, contradiction flagged 9/9).
- Stability of the option set between runs of the same model (Jaccard of
  framework sets): >= 0.8 in most typical scenarios (S1-S4, S6, P1); lower in
  open scenarios: H2 0.56, H2b 0.59, H5 0.62, S7 0.72, S5 0.74.
  - By model: gemini-2.5-flash is the least stable (H2b 0.18: a different set
    of 2-4 frameworks in each run); 3.8-flash and 3.1-pro are mostly stable,
    but the Pro varies in S5 (only Django in one run, Django+Laravel+Rails in
    the others) and H5 (0.42).
- Paraphrases P1a-c: Jaccard between phrasings 0.85 (2.5-flash, 3.8-flash)
  and 1.00 (Pro).
- Platform options included by the LLMs (mean share per answer): 0.8-1.0 in
  most scenarios; H4 0.33 (Laravel in 3/9 answers), H3 0.67 (Expo in 6/9).
- License constraint (to be verified): some frameworks proposed by
  gemini-2.5-flash do not seem to have the requested license, e.g. Sanic
  (MIT) in H2-BSD; go-restful, Revel, LoopBack (MIT) in H2b-Apache.

# Catalogue update and scope (2026-10-13)

- The user fixed Flask in the app (JWT and WebSockets removed; new libraries
  Flask-JWT-Extended and Flask-SocketIO linked to Flask) and added PyJWT.
  Catalogue now: 50 projects (19 frameworks, 31 libraries).
- Scenarios S5 and H4 (built-in admin panel) are dropped from the pilot:
  Laravel's AdminPanel is wrong and fixing it needs a model change (admin
  panel as a library feature), left for later. Pilot = 15 scenarios,
  135 answers per run.
- Platform answers with the updated catalogue: S1 -> DRF+Channels+Celery;
  FastAPI+Celery+SQLAlchemy+PyJWT; Flask+Flask-SocketIO+Flask-JWT-Extended+
  Celery+SQLAlchemy. H2 -> DRF+Channels; Flask+Flask-SocketIO+
  Flask-JWT-Extended. Other scenarios unchanged.
