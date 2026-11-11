# Prompts for the pilot

> **Note:** the instruction below ("Recommend ONE stack") was used in runs 1-2
> (`respuestas/`). Run 3 (`respuestas_multi/`) uses the same scenarios with the
> instruction in `instruccion_multi.txt`, which asks for every suitable stack.

Paste the **common instruction** followed by **one scenario** in a new chat.

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

## Scenarios

**S1**
```
- Backend service written in Python.
- Exposes a REST API.
- Uses an ORM to access a relational database.
- Authentication with JWT.
- Background jobs processed through a RabbitMQ task queue.
- Real-time communication with clients over WebSockets.
```

**S2**
```
- Backend service written in JavaScript or TypeScript.
- Exposes a GraphQL API.
- Stores data in MongoDB through an ODM.
- Real-time communication with clients over WebSockets.
- Background jobs processed through a Redis-based task queue.
```

**S3**
```
- Web frontend written in JavaScript or TypeScript.
- Single-page application (SPA).
- Client-side routing.
- Global state management.
- Internationalisation (i18n).
- Theming support (e.g., light/dark themes) through a component library.
```

**S4**
```
- Frontend for a mobile-only application (no web version).
- Form state management.
- Form validation.
- Data fetching with query caching.
```

**S5**
```
- Full-stack web framework (backend and frontend in the same project).
- Server-side rendering (SSR).
- ORM for a relational database.
- Built-in administration panel.
- Built-in user authentication.
```

**S6**
```
- Backend service written in Java.
- Exposes a REST API.
- Event streaming with Kafka.
- Stores data in a graph database through an OGM.
- Dependency injection as part of the framework architecture.
- Role-based authorisation.
```

**S7**
```
- Backend service written in Go.
- Exposes a REST API.
- Stores data in MongoDB through an ODM.
```

**S8**
```
- Web frontend.
- It must be a single-page application (SPA): the page is never reloaded and
  navigation happens on the client.
- It must also be a multi-page application (MPA): every navigation loads a new
  page from the server.
```

## Platform requests (reference, already run on 2026-10-12)

| Scenario | Request body | Platform answer |
|---|---|---|
| S1 | `[{"type":"Backend","languages":["Python"],"features":["REST","ORM-1","JWT","RabbitMQ","WebSockets"]}]` | DRF + Django Channels + Celery; Flask + Celery + SQLAlchemy |
| S2 | `[{"type":"Backend","languages":["JavaScript/TypeScript"],"features":["GraphQL","ODM-1","WebSockets","Redis"]}]` | NestJS + Bull + Mongoose |
| S3 | `[{"type":"Frontend","languages":["JavaScript/TypeScript"],"features":["Web","SPA","ClientSideRouting","GlobalState-2","i18nInternationalization-2","ThemingSupport-2"]}]` | React + React Router + Zustand + MUI + react-i18next |
| S4 | `[{"type":"Frontend","languages":[],"features":["Mobile","FormStateManagement","Validation","QueryCaching"]}]` | React Native |
| S5 | `[{"type":"Full Stack","languages":[],"features":["SSR-3","ORM-3","AdminPanel","AuthenticationBuiltIn"]}]` | Django; Laravel |
| S6 | `[{"type":"Backend","languages":["Java"],"features":["REST","Kafka","OGM-1","DependencyInjection","Roles"]}]` | Spring Boot |
| S7 | `[{"type":"Backend","languages":["Go"],"features":["REST","ODM-1"]}]` | [] (no framework in the catalogue) |
| S8 | `[{"type":"Frontend","languages":[],"features":["Web","SPA","MPA"]}]` | HTTP 400, rejected by the SAT check |
