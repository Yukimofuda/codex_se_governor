# Web Product Engineering Plan

## Goal

Build an AI-assisted software engineering governance workspace in which requirements, plans, runs, checks, evidence, and release decisions are explicit, connected, and inspectable.

## Users

- Project owner defining scope and approving plans or release decisions.
- Developer connecting an implementation and deterministic validation result.
- Reviewer inspecting failures, security findings, risks, and evidence.
- First-time user exploring the lifecycle without a repository or API key.

## Acceptance Criteria

- The first screen explains the input, process, output, and demo path within one viewport.
- A project cannot be created without a name, problem statement, stack, and default branch.
- A requirement cannot be confirmed without a title, goal, user problem, functional requirement, and acceptance criterion.
- A plan is editable and requires explicit human approval before a run starts.
- A run preserves stage status, actor, input, output, checks, evidence, failure reason, and history.
- Deterministic, AI, human, external, attested, and recorded-demo evidence remain distinguishable.
- Release readiness is derived from run state and attached evidence, not a presentation constant.
- Provider secrets never enter client persistence or the client bundle.
- Desktop and 390px mobile workflows have no horizontal overflow or dead primary actions.

## Domain Model

    Project
      -> Requirement
           -> ExecutionPlan
                -> WorkflowRun
                     -> WorkflowStage
                          -> Check
                          -> Evidence
                     -> ReleaseManifest

WorkspaceState is the browser repository for local projects. Recorded demo data is maintained separately in app/domain/demo.ts and merged through the same domain interfaces.

## Frontend Architecture

- ProductWorkspace coordinates navigation and state transitions.
- AppShell owns global project context, navigation, language, and creation actions.
- Page components map to domain objects rather than independent mock shapes.
- StatusBadge, ActorBadge, and SourceBadge enforce consistent semantics.
- IndexedDB persists non-secret workspace state.
- ZIP and repository checks run in the browser and return structured evidence.

## Server Architecture

    Browser
      -> /api/providers
      -> encrypted HttpOnly provider session
      -> Provider Registry
      -> selected HTTPS model provider

The Provider Registry handles normalization, URL policy, credential validation, model listing, generation, timeout, retry, and error redaction. AI assistance is an explicit operation and cannot manufacture validation or release evidence.

## Security Boundaries

- PROVIDER_VAULT_SECRET is a deployment secret and never a client environment value.
- Provider configuration is encrypted with AES-GCM and stored in an eight-hour HttpOnly session.
- Custom endpoints require HTTPS and reject credentials, non-standard ports, localhost, .local, loopback, link-local, and common private IPv4 ranges.
- Redirects are rejected to limit endpoint policy bypass.
- Uploaded archives are parsed in browser memory and checked for path traversal and generated artifacts.
- The public service has no server-side user-repository execution path.
- Local code execution requires the user to start the loopback-only Runner for one explicit workspace and provide an in-memory bearer token.
- Read-only analysis and workspace-writing implementation are separate Codex sandbox modes; `danger-full-access` is never used.

## Failure Handling

- Missing inputs remain visible on the field that needs correction.
- Provider failures are redacted and recoverable from Settings.
- Imported failed checks keep their raw result and stop the affected run.
- A correction creates a new run instead of mutating historical evidence.
- Unknown and not-run results never become pass.

## Test Strategy

- Pure tests cover project validation, domain transitions, release readiness, ZIP, and URL safety.
- Server tests cover encrypted Provider sessions, redaction, capabilities, and rendered product shell.
- Production build verifies Sites and Worker compatibility.
- Browser QA covers demo, project creation, requirement confirmation, plan approval, run, failure resolution, Provider storage, mobile layout, console errors, and overflow.

## Risk Register

| Risk | Impact | Mitigation | Residual risk |
|---|---|---|---|
| Browser data is cleared | User loses local work | State the storage boundary and support evidence download | No cloud recovery |
| Imported data is mistaken for a live run | Incorrect release confidence | Actor/source badges and preserved manifest output | Manifest authenticity is not cryptographically verified |
| Provider key is exposed | Secret compromise | Server-only handling, encryption, HttpOnly, masking, redaction | Sites operators and selected provider remain trusted processors |
| Custom Provider enables SSRF | Internal access | HTTPS, hostname/IP/port checks, redirect rejection | DNS rebinding needs platform egress controls for complete mitigation |
| Recorded demo looks live | Misleading status | Recorded-demo source on project, run, and evidence | Users may still skim the source label |

## Rollback

Keep the previous immutable Sites version. On regression, redeploy it, then revert only the Web product commit. The browser schema version remains unchanged so local projects survive a UI rollback.
