# ADR: Add Login Failure Counter Bug Fix

## Status

Accepted for example.

## Context

Unlimited login failures increase brute-force risk. The login flow needs a reversible, testable control that does not reveal account existence.

## Decision

Introduce a login attempt limiter with a threshold of 5 failed attempts in a 15-minute window and temporary lockout. Policy values are named and configurable.

## Alternatives

| Alternative | Why Considered | Decision |
|---|---|---|
| No change | Avoids UX friction | Rejected due to security risk |
| IP-only throttling | Limits automated traffic | Rejected as insufficient alone |
| CAPTCHA | Adds human challenge | Deferred due to dependency and UX cost |

## Consequences

- Positive: better brute-force resistance and audit evidence.
- Negative: possible deliberate account lockout.
- Neutral: requires short-lived counter storage.

## Quality Attributes Affected

| Attribute | Effect | Response Measure |
|---|---|---|
| Security | Improved | Lockout after threshold |
| Usability | Trade-off | Generic recovery message |
| Reliability | New storage dependency | Graceful failure policy |

## Risk

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Lockout abuse | Medium | Medium | Temporary lockout, monitoring, recovery path |
| Counter store outage | Low | Medium | Conservative fallback and alert |

## Rollback

Disable limiter configuration and remove login flow invocation after verifying no migration is needed.
