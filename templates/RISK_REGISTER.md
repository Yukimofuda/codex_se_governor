# Risk Register

| Risk ID | Description | Category | Probability | Impact | Exposure | Mitigation | Contingency | Residual risk | Trigger | Detection method | Review cadence | Owner | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| R-001 |  | Technical/Project/Security/People/Dependency | Low/Med/High | Low/Med/High |  |  |  |  |  |  | Planning/PR/Release/Retrospective |  | Open |

## Probability Scale

- Low: unlikely during this release or task.
- Medium: plausible under normal project conditions.
- High: likely unless actively mitigated.

## Impact Scale

- Low: local inconvenience with easy recovery.
- Medium: user-visible defect, schedule slip, or maintainability cost.
- High: security, data loss, compliance, major outage, or missed delivery.

## Exposure Calculation

Exposure should combine probability and impact. Use a simple Low/Medium/High score unless the project has numeric scoring.

## Mitigation vs Contingency

- Mitigation reduces probability or impact before the risk occurs.
- Contingency is the fallback plan if the risk occurs.

## Residual Risk

Document what remains after mitigation and who accepts it.

## Trigger And Detection

- Trigger: observable condition that indicates the risk may occur.
- Detection method: metric, test, review, alert, stakeholder report, or release signal used to detect the trigger.

## Review Cadence

Review at planning, before PR merge, before release, and during retrospective.
