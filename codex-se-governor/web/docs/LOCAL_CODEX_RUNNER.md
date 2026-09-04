# Local Codex Runner

## Purpose

The public Sites application cannot and should not mount a user's local repository. The Local Codex Runner is an explicit bridge that the user starts inside the Web project and binds to exactly one repository workspace.

## Start

1. Open **Settings -> Local Codex Runner**.
2. Generate a temporary token. It exists only in the current tab's React memory.
3. Run from the `web/` directory:

       npm run runner -- --workspace /absolute/path/to/repository --token <temporary-token>

4. Keep that terminal open and select **Test local connection**.
5. Review the approved Requirement and Plan before allowing an implementation run.

## Request Boundary

- Bind address: `127.0.0.1` only.
- Default port: `4777`.
- Authentication: constant-time bearer-token comparison.
- Browser origins: the public Sites origin and explicit localhost development origins only.
- Concurrency: one active run.
- Prompt and output sizes: bounded.
- Process timeout: bounded and the child is terminated on timeout.
- Command construction: argument array with no shell interpolation.
- Network exposure: none beyond the loopback interface.

## Codex Permissions

| Operation | Codex sandbox | Intended effect |
|---|---|---|
| Analysis | `read-only` | Inspect the approved workspace without writes |
| Implementation | `workspace-write` | Apply the approved plan inside the selected workspace |

The Runner always sets `approval_policy="never"` for the non-interactive child process and never enables `danger-full-access`. It does not receive arbitrary shell commands from the browser.

## API

- `GET /health`: authenticated workspace and runner status.
- `POST /runs`: starts one bounded Codex execution from a structured brief.
- `GET /runs/:id`: returns sanitized status and output.
- `DELETE /runs/:id`: stops an active run.

The browser stores the Runner URL and token only in current React memory. It does not write them to localStorage, IndexedDB, exported ZIP files, or server logs.

## Trust Model

The user remains responsible for choosing the workspace, reviewing the Requirement and Plan, inspecting the resulting diff, and running project-specific tests. The Runner is a local execution transport; it is not evidence that a build, test, security review, or release gate passed. Those conclusions require separate checks attached to the current Run.

## Stop And Recover

Stop the Runner terminal or use **Stop local run** in the Run page. If a run fails, keep the failure output as evidence, inspect the repository diff, restore or revert through the repository's normal version-control process, and create a new correction Run rather than overwriting the failed one.
