# Codex SE Governor Web

Public, local-first user workspace for creating and inspecting software engineering governance artifacts without a terminal.

## Product Boundary

- Projects, tasks, artifacts, revisions, uploaded ZIP files, and metrics stay in the browser.
- IndexedDB stores local projects on the current device.
- The Sites Worker exposes only a read-only capability endpoint.
- Uploaded Python, JavaScript, shell scripts, tests, package scripts, Makefiles, and binaries are never executed.
- Browser-static results never claim to be the Python governor's full validation result.

## Local Development

Use Node.js 22.13 or newer.

```bash
npm ci --ignore-scripts
npm run dev
```

## Validation

```bash
npm run build
npx tsc --noEmit
node --test tests/*.test.mjs
```

The tests cover task artifact generation, requirement-to-test traceability, prompt boundaries, adoption checks, UTF-8 ZIP output, path traversal rejection, server rendering, and the Sites capability endpoint.

## Architecture

- `app/GovernorApp.tsx`: interactive workspace and local project lifecycle.
- `app/lib/governance.mjs`: artifact generation, metrics, adoption rules, and prompt generation.
- `app/lib/zip.mjs`: dependency-free UTF-8 ZIP creation and central-directory inspection.
- `app/lib/storage.ts`: IndexedDB persistence.
- `app/api/capabilities/route.ts`: public execution-boundary declaration.

## Release

Publish only through Sites. Do not manually compress or host a copy that changes the declared execution and privacy boundary.
