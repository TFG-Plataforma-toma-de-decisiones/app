# OSS Configurator: Model-Guided Elicitation for Open-Source Technology Selection

This repository contains the platform and the evaluation material of the paper
*From Prompts to Configurations: Model-Guided Requirements Elicitation for
Open-Source Technology Selection*.

Users specify the technical requirements of a system by configuring a feature
model written in the Universal Variability Language (UVL). The configuration
is validated with a SAT solver and matched deterministically against an
annotated catalogue of open-source projects, which returns every valid stack.
An LLM is only used to discuss the valid stacks (SWOT analysis) and to assist
the curation of the catalogue.

## Repository structure

| Path | Content |
|---|---|
| `backend/` | Django backend: elicitation API, SAT validation (Flamapy), deterministic matching, LLM services |
| `backend/configurador/fixtures/model.uvl` | UVL feature model of web development (171 features) |
| `backend/configurador/fixtures/datos.json` | Annotated catalogue (74 open-source projects) |
| `backend/configurador/views.py` | `get_recommendation`: the matching algorithm described in the paper |
| `backend/configurador/prompt_*.txt` | Prompts of the SWOT analysis and of the LLM-assisted curation |
| `frontend/` | React frontend; the elicitation form is generated from the model |
| `docker/` | Docker configuration |
| `paper/evaluation/` | Scripts and results of the preliminary evaluation (RQ1-RQ3) |
| `paper/pilot/` | Prompts, scripts, LLM answers and analysis of the comparison with LLMs (RQ4) |

## Running the platform

Requirements: Docker and Docker Compose.

1. Copy `backend/.env.example` to `backend/.env` and fill in the values. A
   Gemini API key (`GEMINI_API_KEY`) is only needed for the SWOT analysis and
   the LLM-assisted curation; the elicitation and the recommendation work
   without it.
2. Start the services:
   ```
   docker compose -f docker/docker-compose-dev.yml up --build
   ```
3. Load the model and the catalogue:
   ```
   docker compose -f docker/docker-compose-dev.yml exec web python manage.py reset_db
   ```
4. Open the frontend at <http://localhost:5173> (API at <http://localhost:8000/api/v1/>).

The backend tests can be run with
`docker compose -f docker/docker-compose-dev.yml exec web python manage.py test configurador.test`.

## Reproducing the evaluation

The evaluation runs offline on the same model and catalogue used by the
platform. It needs Python 3.11 or later and Flamapy:

```
pip install flamapy==2.5.0 dd
cd paper/evaluation
python evaluate.py ../../backend/configurador/fixtures .
python real_projects.py ../../backend/configurador/fixtures .
```

- `evaluate.py` computes the metrics of the model (Table 1), validates every
  annotation of the catalogue, and runs the 15 scenarios 100 times each,
  checking that the output is identical and that every stack covers the
  requested features (Table 2, RQ2 and RQ3).
- `real_projects.py` maps the capabilities of ten real applications to the
  model, lists the evidence found in their manifests for each capability, and
  checks whether the platform returns their real framework (Table 3, RQ1 and
  RQ3).
- `compare_api.py` checks that the offline port returns exactly the same
  stacks as the running platform (requires step 3 above).

The results are stored in `resultados_evaluacion.json` and
`resultados_proyectos_reales.json`. The files ending in
`_catalogo_inicial.json` contain the results with the initial catalogue of 61
projects, before it was extended (column *Init.* of Table 3).

## Comparison with LLMs (pilot)

`paper/pilot/` contains the material of RQ4, run with three Gemini models
(2.5 Flash, 3.8 Flash and 3.1 Pro), default settings and three runs per
scenario:

- `prompts.md` and `prompts_hard.md`: the scenarios and the instruction asking
  for one stack; `instruccion_multi.txt`: the instruction asking for every
  suitable stack.
- `respuestas/` and `respuestas_multi/`: all raw answers (306). The paper uses
  270 of them; the other 36 belong to two scenarios (S5 and H4) that were
  dropped because of an error in the catalogue at that time.
- `run_gemini.py`: runs the prompts (requires `GEMINI_API_KEY`, as an
  environment variable or in `backend/.env`).
- `normalise.py`, `summarise.py` and `analyse_multi.py`: normalisation of
  component names and analysis; their outputs are the `.csv` files.
- `PROTOCOLO.md` and `OBSERVACIONES.md`: protocol and working notes (in
  Spanish).

Note that the scenarios were run against the catalogue and model of October
2026; the current evaluation scripts use the final model, in which the Redis
queue features are named `RedisQueue`.
