# Workspace Product Review

## Scope And Acceptance

This iteration compares the implemented workspace against the requested project / requirement / plan / run / check / evidence / release product. It changes the working interface, not the provider architecture or the governance course. A first-time user must be able to create a project, save unfinished work, select an older requirement, open its plan and run, and distinguish missing results from passing results.

Acceptance: no cross-requirement summaries; saved drafts survive navigation and reload; explicit local-save failure feedback; no page-wide horizontal overflow at 390, 820, and 1440 pixels; consistent status labels; keyboard-accessible navigation; existing tests plus context and browser regressions pass.

## Visual Research

Actual official product screenshots inspected, not only marketing descriptions:

- [Linear project overview](https://linear.app/docs/project-overview): compact project context, plain property rows, resources adjacent to work, restrained separators. Adopt its hierarchy, not its visual identity.
- [Vercel project dashboard](https://vercel.com/docs/projects/project-dashboard): deployment rows put status, revision, time, and action together. Adopt the row-to-detail interaction for runs.
- [Apple writing guidance](https://developer.apple.com/design/human-interface-guidelines/writing): clear, concise action labels. Apply this through shorter labels and contextual errors, not interface text about design principles.
- [Braintrust experiment comparison](https://www.braintrust.dev/docs/evaluate/compare-experiments): documentation review only; distinguish recorded data and comparison context. No claim to have accessed its authenticated workspace.

Browser automation could not open the external reference tabs in this session. Official screenshots were opened as images; local browser acceptance uses the project's Playwright QA.

## Design Decision

Use a flat, neutral workspace with one page heading, compact navigation, real requirement rows and run rows, and a secondary project inspector. Remove the oversized first-use hero, repeated completion cards, repeated lifecycle map, and unsupported "no blockers" message. Detailed stages remain in Run. Quality controls remain in Settings. Keep the existing generated brand asset; additional decorative imagery would take space away from work.

Use system fonts, 24px page headings, 14px body copy, 6px controls, 8px dialogs, and restrained blue actions. Status uses both icon and text. Dark mode, small screens, reduced motion, focus trapping, and the existing encrypted provider boundary are preserved.

## Product Findings

| Priority | Finding | Product consequence | Disposition |
| --- | --- | --- | --- |
| P1 | Runner connection is global and has no project/repository fingerprint binding | A project switch can dispatch to the wrong local repository | Requires a separate execution-safety change before claiming unattended multi-project execution. Transport connectivity is not repository verification. |
| P1 | Approved plan edits are not fully compiled into the execution contract; dispatch reads live objects | What the user approves can differ from what Codex receives | Bind execution to immutable plan/requirement snapshots and preserve all task fields in a dedicated follow-up. |
| P1 | Import normalization replaces policy check identifiers | Valid results cannot satisfy the selected policy | Fix explicit check identity and add policy-key regression tests in this iteration. |
| P1 | Release approval and imported results lack immutable repository/revision binding | A displayed release decision is not independently proven readiness | Imported records now remain explicitly imported, with raw fields preserved, rather than being promoted to verified. Unsigned imports alone cannot satisfy the existing verified-evidence gate. Full provenance and invalidation require deeper execution changes. |
| P2 | Only the latest requirement is reachable; manual drafts are component-local | Users lose work and see mismatched plans/runs | Persist a selected requirement and autosave drafts; unify context selection across pages. |
| P2 | Requirement AI settings and Codex execution readiness are conflated | A connected provider looks like executable Codex configuration | Use distinct names for requirement assistance and local Codex execution; transport health remains insufficient authentication preflight. |

## Prioritized Product Work

1. Bind a runner connection to one project before code execution. The handshake should return a repository identity and revision. The UI must show that identity for confirmation; dispatch must reject a changed identity on the server, not merely display a warning. Acceptance: switching from project A to B cannot execute in A's directory.
2. Make approval an immutable execution contract. Store a hash of the confirmed requirement, full edited plan, policy, and repository revision. Pass the approved tasks, dependencies, allowed paths, and checks to Codex. Changes invalidate approval. Acceptance: modifying a plan after approval blocks dispatch until it is approved again.
3. Bind release evidence to that contract. Preserve every run's artifacts separately, attach actual command outcomes and revision to runner-produced results, and distinguish imported reports from trusted execution records. Release decisions must reference those exact records. Acceptance: a successful report from another revision or another run cannot unlock release.

These are prerequisites for describing the application as unattended end-to-end governed development. The current UI supports structured planning, local execution entry points, imported results, and human review; visual polish alone does not close these three gaps.

## Implementation Boundaries

The existing React/Vinext stack, domain services, API routes, and IndexedDB remain. A small pure context selector aligns requirement, plan, and run pages. The optional active requirement ID is backward compatible with schema version 5. Draft edits update shared state immediately and persist through the existing debounced store; save failures remain visible and retryable. Confirming a requirement must not overwrite already edited artifact files.

Risks: layout regressions in dense inspectors; stale historical assumptions; IndexedDB unavailable or full; generated drafts mistaken for execution results. Mitigations: viewport geometry assertions, multi-requirement navigation tests, persistent save-error UI, explicit draft and not-evaluated labels.

## Test And Rollback Plan

Run lint, TypeScript, Node tests, production build, and browser QA. Exercise initial project creation, multiple drafts, refresh, selection, demo failure inspection, checks/evidence/release, language/theme, and mobile drawer focus. Independent review should inspect screenshots and report defects rather than treating a numeric design score as proof.

Rollback the scoped UI/context commit without rewriting earlier history. The optional selected requirement field can be ignored by the prior version. No migration deletes projects, artifacts, or uploaded evidence. Retrospective: test continuity between screens, not just whether each screen renders.

## Verification Results

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed. Vinext reports its existing route-classification limitation; no build failure.
- `node --test tests/*.test.mjs`: 91 passed, 0 failed. Includes policy check identifier coverage, selection isolation, import provenance, archive and provider boundaries.
- `BASE_URL=http://localhost:3010 npm run qa:product`: all six flows passed in local Chrome with no collected console/page/HTTP errors. Tested demo lifecycle, project creation, two requirements, refresh, save failure and retry, historical failure details, provider/runner boundaries, mobile drawer and keyboard focus, dark mode, English UI, and tablet-to-desktop resizing.
- Viewports: 390, 820, and 1440 pixels, plus intermediate form widths. Geometry assertions check sidebar width/content inset and page overflow, not only screenshots.
- Independent visual review first scored the screenshots 83/100 and identified a resize capture/geometry problem, low placement of current work on small screens, and unscoped check counts. All three prompted changes and new browser assertions/screenshots. The score is a design opinion, not a release gate.
- After inspecting the new light/dark desktop and mobile images, the reviewer closed those three findings and gave a provisional UI-only score of 90/100. Remaining visual trade-offs are the prominence of New requirement versus the current-stage action and dense secondary information on mobile; this is not a claim of complete product maturity.
- The repository's `python3 scripts/se_gate.py` also passed.
- Public deployment was not performed: the existing Sites project returned `NOT_FOUND` under the available account. No replacement site was created. Provider tests use controlled test responses; this iteration did not call paid models or run Codex against a user's repository.

Raw screenshots and browser results are local `.qa/` outputs and are intentionally not shipped as product data. Safari and Firefox were not run in this iteration.
