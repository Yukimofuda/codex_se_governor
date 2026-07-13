# Design: Login Failure Counter Bug Fix

## Design Goal

Add brute-force resistance without changing password verification semantics or exposing account existence.

## Current Architecture

Login requests flow through a login controller into an authentication service. Failed attempts are not tracked.

## Proposed Architecture

Add a small `LoginAttemptLimiter` between request validation and password verification. It uses a configurable policy and a short-lived counter store.

## Alternatives Considered

| Alternative | Pros | Cons | Decision |
|---|---|---|---|
| Account-only lockout | Simple | Attackers can lock victim accounts | Use with temporary duration and audit |
| IP-only throttling | Reduces distributed account lockout | Weak against distributed attacks; can affect shared networks | Optional metadata only |
| CAPTCHA after failures | Good user recovery | Adds UX and vendor dependency | Future enhancement |

## Module Boundaries

| Module | Responsibility | Owns | Does Not Own |
|---|---|---|---|
| LoginAttemptLimiter | Decide if attempt allowed; record result | Threshold/window policy | Password verification |
| CounterStore | Store short-lived counters | Expiry and count | Business policy |
| AuditLogger | Emit allowlisted security events | Event schema | Authentication decision |

## Interfaces

| Interface | Consumer | Provider | Contract | Error Behavior |
|---|---|---|---|---|
| `is_allowed(identifier)` | Login flow | Limiter | Returns allowed/blocked and retry time | Safe generic failure |
| `record_failure(identifier)` | Login flow | Limiter | Increments and may lock | Audit threshold |
| `record_success(identifier)` | Login flow | Limiter | Clears counter | Ignore missing counter |

## Data Model

- Key: normalized account identifier.
- Value: failure count, first failure time, lockout expiry.
- TTL: at least login window plus lockout duration.

## SOLID Review

- SRP: limiter owns rate-limit policy only.
- OCP: thresholds can change through config without modifying login flow.
- LSP: no inheritance introduced.
- ISP: login flow depends on a small limiter interface.
- DIP: login flow depends on limiter abstraction, not a concrete cache.

## Pattern Justification

| Pattern | Design Pressure | Simpler Alternative | Consequences |
|---|---|---|---|
| Strategy | Different policies may be needed for admin/user accounts | Inline threshold check | Strategy is justified only if multiple policies exist; otherwise keep one policy object |

## Quality Attribute Impact

| Attribute | Positive Impact | Negative Impact | Evidence |
|---|---|---|---|
| Security | Reduces brute-force attempts | Lockout can be abused | Security tests and audit |
| Usability | Generic recovery message | Temporary friction after mistakes | Acceptance test |
| Maintainability | Isolated limiter | Additional component | Code review |
