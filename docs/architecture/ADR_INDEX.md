# ADR Index

| ADR | Status | Decision | Link |
|---|---|---|---|
| ADR-001 | Accepted | Keep governor file-based and copyable instead of a server or package manager dependency. | This document |
| ADR-002 | Accepted | Keep validators standard-library-only; pytest is allowed only for tests. | This document |
| ADR-003 | Accepted | Use Markdown baseline for smell triage instead of suppressing scanner output. | `docs/quality/SMELL_BASELINE.md` |
| ADR-004 | Accepted | Use subprocess tests for CLI scripts to match real repository-root behavior. | `tests/test_scripts.py` |

## Future ADR Candidates

- Versioned adoption manifest.
- Optional language-specific analyzer packs.
- Coverage or mutation-test adapter.

