# Product Architecture

## Product Boundary

Codex SE Governor is a software engineering governance workspace, not a prompt wrapper. Its durable product hierarchy is:

    Project
      -> Requirement
        -> Execution Plan
          -> Workflow Run
            -> Workflow Stage
              -> Check
              -> Evidence
            -> Release Manifest

A page may summarize these objects, but it must not invent a parallel mock shape. Recorded demo data implements the same interfaces and is explicitly marked as recorded.

## Lifecycle Mapping

| Stage | Course responsibility | Required product evidence | Decision source |
|---|---|---|---|
| Project context | Software type, data, quality, process | `PROJECT_CONTEXT.md` | Human |
| Requirements | Stakeholders, FR, NFR, constraints, conflicts | `REQUIREMENTS.md` | Human |
| User story | Role, goal, value, INVEST, acceptance | `USER_STORY.md` | Human |
| Analysis | Domain, EBC, relationships, failure modes | `ANALYSIS.md` | AI draft and human review |
| Design and architecture | Boundaries, SOLID, patterns, 4+1, trade-offs | `DESIGN.md`, `ADR.md` | AI draft and human review |
| Risk and quality | Probability, impact, trigger, mitigation, quality scenarios | `RISK_REGISTER.md`, `QUALITY_ATTRIBUTE_SCENARIOS.md` | Human |
| Implementation plan | Dependencies, outputs, checks, rollback points | `PROCESS_COMPLIANCE_REPORT.md` | Human approval |
| Implementation | Minimal change and AI-use disclosure | `IMPLEMENTATION_LOG.md`, `AI_USAGE_REVIEW.md` | Local Codex plus human review |
| Deterministic validation | Build, lint, type, policy, complexity | `VALIDATION_RESULTS.json` | Machine result |
| Testing | Unit, integration, boundary, failure, security, regression | `TEST_PLAN.md`, `TEST_CASE_MATRIX.md`, `TEST_RESULTS.md` | Machine result |
| Security review | Trust, input, auth, secrets, dependencies, deployment | `SECURITY_REVIEW.md` | Human review plus checks |
| Documentation and delivery | Usage, deployment, maintenance, migration | `DEPLOYMENT_PLAN.md`, `MAINTENANCE_TASK.md`, `FINAL_REPORT.md` | Human |
| Release decision | Blockers, warnings, accepted risks, approval | `RELEASE_MANIFEST.json` | Policy plus owner |
| Retrospective | Root cause, rule updates, maintenance follow-up | `RETROSPECTIVE.md` | Human |

## Choice-to-Policy Pipeline

Project setup never asks a non-specialist to invent latency, availability, or security prose. The user selects a concrete operating scenario for security, privacy, reliability, performance, and process. Each selection is mapped in `app/domain/course-policy.ts` to:

1. when the choice applies;
2. controls the implementation must provide;
3. conditions that block release;
4. required artifacts;
5. required checks.

The same mapping drives the setup preview, generated quality scenarios, project policy, Overview counts, and Release readiness. A choice therefore changes persisted domain data and gates, not only explanatory text.

## State And Services

- `ProductWorkspace` coordinates state transitions and routes actions to domain functions.
- `app/domain/` owns object definitions, lifecycle rules, release policy, and centralized demo data.
- `app/lib/storage.ts` persists non-secret workspace state in IndexedDB.
- `app/lib/governance.mjs` generates traceable artifact content and browser-side adoption results.
- `app/lib/zip.mjs` creates UTF-8 ZIP files and rejects traversal or generated archive artifacts.
- `app/server/` owns Provider adapters, URL policy, error redaction, and encrypted sessions.
- `local-runner/` is an optional user-operated loopback bridge to Codex CLI.

## Evidence Semantics

The UI never derives `PASS` from the existence of prose. Every result records an actor and source:

- deterministic: command, exit status, duration, and output;
- AI: draft or review suggestion;
- human: confirmation, approval, or accepted risk;
- local-runner: output from the user-operated Codex CLI bridge;
- attested: user-supplied claim;
- recorded-demo: fixed explanatory sample.

`UNKNOWN`, `NOT RUN`, `PENDING`, `WARNING`, `FAILED`, and `PASSED` remain distinct. Release readiness uses only the current run and cannot treat a draft or unknown result as verified evidence.

## User Flows

### New Project

    Select code source
      -> define product boundary
      -> choose delivery process
      -> choose quality scenarios
      -> review derived artifacts/checks/approvals
      -> create workspace

The wizard blocks progression when required information is missing. Each quality choice displays its controls, blockers, checks, and resulting artifact set before project creation.

### Governed Change

    Original request
      -> structured and confirmed requirement
      -> editable 14-stage plan
      -> owner approval
      -> independent run
      -> checks and evidence
      -> release readiness
      -> release manifest

### Failure

    Failed check
      -> failed stage
      -> command/output evidence
      -> correction in a new run

Historical runs are not overwritten.

## Deployment Boundaries

The Sites deployment serves the React workspace and Provider API. Uploaded ZIP content remains in browser memory. Provider secrets are encrypted into a short-lived HttpOnly session and are never returned in full. Sites cannot directly access a user's local repository; local execution requires the separate Runner described in `LOCAL_CODEX_RUNNER.md`.
