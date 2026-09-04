# Product Design Decisions

## Product Definition

Codex SE Governor is an AI-assisted Software Engineering Governance Workspace. Its job is to turn an unclear request into an approved and auditable engineering process. Prompt generation remains a supporting capability, not the information architecture.

## Research Synthesis

The redesign studied current product structures instead of copying their visual styling:

- Braintrust and LangSmith treat projects, runs, traces, evaluations, datasets, feedback, and providers as durable product objects.
- GitHub Actions makes workflow, job, step, run, log, and artifact status inspectable at progressively deeper levels.
- Sentry starts with current impact and next action, then reveals evidence, events, traces, environment, and resolution history.
- Vercel keeps project context persistent while separating deployments, settings, environment, logs, and secrets.
- Linear uses a stable workspace boundary, compact navigation, clear command hierarchy, and dense but calm information presentation.

These patterns led to the Governor hierarchy:

    Project -> Requirement -> Plan -> Run -> Stage -> Check -> Evidence -> Release

## Information Architecture

Overview answers three questions: current state, blocking risk, and next action. Primary navigation exposes Projects, Requirements, Plan, Workflow, Checks, Evidence, Release, and Run history. Settings contains repository, Provider, policy, execution boundary, and data handling.

The interface never uses an oversized project name as a decorative hero. The current project is context; the current engineering decision is the page subject.

## Progressive Disclosure

- Overview shows summaries and one next action.
- Workflow reveals stages.
- A stage reveals checks and evidence.
- A check reveals command, result, duration, and raw output.
- Evidence reveals provenance and downloadable content.
- Release combines only completed run evidence into a decision.

## Content Rules

- Buttons name the result, such as Confirm requirement, Approve plan, and Import validation manifest.
- Engineering terms appear where they correspond to real domain objects and include short contextual help.
- Internal template vocabulary is not used as user guidance.
- Errors name the missing input or failed action and provide the recovery path.
- AI output is called a draft. Recorded demonstrations and user attestations are labeled at the point of use.
- Unknown evidence remains unknown.

## Forms

Project creation asks only for a project boundary, code source, and release policy. It does not ask users to choose abstract High/Low levels or invent p95, RTO, RPO, reliability, or compliance prose during onboarding.

Requirements accept natural language first. Structured fields are editable, required fields are explicit, and quality/security detail is disclosed only when needed. AI-assisted structuring never confirms the result automatically.

## Visual System

- macOS/iOS system typography with neutral, high-contrast surfaces.
- Stable top project context and compact left navigation.
- 7 to 10px radii, restrained translucent surfaces, and a subtle grid.
- Purple and gold gradient only on the brand and global create action.
- Deep blue for focus and selection.
- Status always combines icon, text, and color.
- Responsive layouts reorganize information instead of shrinking desktop grids.

## Demo Integrity

The sample project is centralized in app/domain/demo.ts, explicitly marked recorded-demo, and loaded through the normal service and state layer. It includes a failed run and a corrected run so users can inspect failure evidence and historical continuity.

## Capability Honesty

The public app can structure requirements through a configured Provider, inspect browser-side ZIP and file structure, import deterministic validation manifests, and generate release decisions from workspace evidence. It never executes an uploaded archive or public GitHub repository. Code execution is available only through an explicitly started loopback-only local runner that binds one user-approved workspace to the locally authenticated Codex CLI. The product does not authenticate private GitHub access, collaborate across accounts, or claim imported results are cryptographically authentic.
