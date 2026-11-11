# Pilot run 2 — harder scenarios and paraphrases

> **Note:** the instruction below ("Recommend ONE stack") was used in runs 1-2
> (`respuestas/`). Run 3 (`respuestas_multi/`) uses the same scenarios with the
> instruction in `instruccion_multi.txt`, which asks for every suitable stack.

Same common instruction as `prompts.md`.

## Common instruction

```
You are helping a development team choose the technology stack for a new project.
Recommend ONE stack made of open-source frameworks and libraries that satisfies
ALL the requirements below. If the requirements cannot be satisfied together,
say so instead of recommending a stack.

Answer only with this JSON:
{
  "framework": "<main framework>",
  "libraries": ["<library>", "..."],
  "coverage": [{"requirement": "<requirement>", "covered_by": "<framework or library>"}],
  "issues": "<any conflict or problem with the requirements, or empty>"
}

Requirements:
```

## Harder scenarios

**H1** (many requirements)
```
- Backend service written in Python.
- Exposes a REST API with automatically generated OpenAPI documentation.
- Generic CRUD abstractions to expose models with little code.
- ORM for a relational database.
- Authentication with JWT and with OAuth2.
- Authorisation based on both roles and fine-grained permissions.
- Declarative validation of requests and schema-based validation.
- Caching with both Redis and Memcached.
- Background jobs that can run both on RabbitMQ and on AWS SQS.
- Real-time communication with clients over WebSockets.
```

**H2** (license constraint)
```
- Backend service exposing a REST API, in any language.
- The main framework must be distributed under the BSD license.
- Authentication with JWT.
- Real-time communication with clients over WebSockets.
```

**H2b** (license constraint)
```
- Backend service exposing a REST API, in any language.
- The main framework must be distributed under the Apache 2.0 license.
- ORM for a relational database.
- Background jobs processed through a RabbitMQ task queue.
```

**H3** (cross-platform frontend)
```
- A single frontend codebase that runs both on the web and on mobile devices.
- Offline support.
- The app must be installable (PWA-style installation on the web).
- Internationalisation (i18n).
- Global state management.
- Form validation.
```

**H4** (full stack)
```
- Full-stack web framework (backend and frontend in the same project).
- Server-side rendering (SSR).
- Real-time communication with clients over WebSockets.
- Background jobs processed through a Redis-based queue.
- Caching with Redis.
- Built-in administration panel.
```

**H5** (two parts)
```
- Backend service written in Ruby that exposes a REST API, stores data in
  MongoDB through an ODM and processes background jobs with a Redis-based queue.
- A separate mobile-only frontend (no web version) with global state
  management and internationalisation (i18n).
For this scenario, recommend the stack of each part: use "framework" and
"libraries" for the backend and add "frontend_framework" and
"frontend_libraries" to the JSON.
```

## Paraphrases of S1 (determinism)

**P1a**
```
We are building an API in Python. It should follow REST conventions and persist
data in PostgreSQL using an ORM. Users log in and receive a JWT. Some tasks are
slow, so they must run in the background using RabbitMQ. The browser client
also needs live updates pushed from the server through WebSockets.
```

**P1b**
```
- Language: Python
- API style: REST
- Persistence: relational database accessed through an ORM
- Authentication: JSON Web Tokens
- Asynchronous jobs: RabbitMQ
- Real-time: WebSockets
```

**P1c**
```
Our startup needs the server side of a new product. The team only knows Python.
Clients will talk to it via a RESTful interface. We need object-relational
mapping for our SQL database, token-based (JWT) authentication, a message
broker (RabbitMQ) to offload long-running jobs, and a persistent bidirectional
channel (WebSockets) for notifications.
```

## Platform answers (2026-10-12)

| Scenario | Request body | Platform answer |
|---|---|---|
| H1 | `[{"type":"Backend","languages":["Python"],"features":["REST","ORM-1","JWT","OAuth2","Roles","Permissions","RequestValidation","SchemaValidation","OpenAPIDocumentationSupport","Redis-1","Memcached-1","RabbitMQ","AWSSQS","WebSockets","GenericCRUDAbstractions"]}]` | DRF + Django Channels + Celery |
| H2 | `[{"type":"Backend","languages":[],"features":["REST","BSD-1","JWT","WebSockets"]}]` | Flask; DRF + Django Channels |
| H2b | `[{"type":"Backend","languages":[],"features":["REST","Apache-1","ORM-1","RabbitMQ"]}]` | Spring Boot |
| H3 | `[{"type":"Frontend","languages":[],"features":["Web+Mobile","OfflineSupport","InstallableApp","i18nInternationalization-2","GlobalState-2","Validation"]}]` | Expo + i18next + yup + Redux |
| H4 | `[{"type":"Full Stack","languages":[],"features":["SSR-3","WebSockets-3","Redis-5","Redis-3","AdminPanel"]}]` | Laravel |
| H5 | `[{"type":"Backend","languages":["Ruby"],"features":["REST","ODM-1","Redis"]},{"type":"Frontend","languages":[],"features":["Mobile","GlobalState-2","i18nInternationalization-2"]}]` | Rails (API) + Sidekiq + Mongoid; React Native |
| P1a–c | same request as S1 | always DRF + Channels + Celery; Flask + Celery + SQLAlchemy |
