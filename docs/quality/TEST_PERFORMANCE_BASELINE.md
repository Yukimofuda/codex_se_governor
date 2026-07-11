# Test Performance Baseline

These are portability budgets, not observed averages. Raising a threshold requires measured evidence, owner review, rationale, and a target version.

| Suite | Threshold Seconds | Owner | Rationale | Target Improvement Version |
|---|---:|---|---|---|
| unit | 15 | governor-maintainer | Pure-function and focused unit tests must provide immediate feedback. | v0.8 |
| integration | 120 | governor-maintainer | CLI integration tests may start isolated Python subprocesses but must remain bounded. | v0.8 |
| fast | 60 | governor-maintainer | Canonical local tests include unit and integration without e2e. | v0.8 |
| e2e | 180 | governor-maintainer | Archive and orchestration boundary tests are explicit and isolated. | v0.8 |
| release | 600 | governor-maintainer | Release validation includes all tiers, packaging, archive hashes, and final cleanup. | v0.8 |
