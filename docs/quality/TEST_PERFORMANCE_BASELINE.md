# Test Performance Baseline

Suite threshold seconds: 30

| Scope | Threshold Seconds | Owner | Rationale | Target Improvement Version |
|---|---:|---|---|---|
| full pytest suite | 30 | governor-maintainer | Governance tests execute many subprocess validators; keep the suite under fast local feedback budget. | v0.8 |

| Test Or Scope | Allowed Seconds | Owner | Rationale | Target Improvement Version |
|---|---:|---|---|---|
| e2e full validation | 18 | governor-maintainer | Full-copy E2E test intentionally exercises the real orchestration flow once. | v0.8 |
