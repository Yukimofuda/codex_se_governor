# Analysis: Login Failure Counter Bug Fix

## Domain Concepts

| Concept | Meaning | Business Rule |
|---|---|---|
| Account identifier | Username/email submitted for login | Must not reveal existence in responses |
| Failed attempt | Invalid credential submission | Counted within a rolling time window |
| Lockout | Temporary refusal to attempt authentication | Triggered after threshold reached |
| Audit event | Security-relevant record | Must not include password or secrets |

## Entities

| Entity | Responsibility | Invariants |
|---|---|---|
| LoginAttemptCounter | Stores count and expiry window | Count never negative; expires after window |
| Account | Existing authenticated principal | Successful login clears failure state |
| SecurityAuditEvent | Records security event metadata | No sensitive credential material |

## Boundary Objects

| Boundary | Actor/System | Input | Output |
|---|---|---|---|
| Login API | User/client | Identifier, password | Generic success/failure/lockout response |
| Audit sink | Security monitoring | Event metadata | Stored/forwarded audit event |

## Control Objects

| Control | Workflow | Coordinates | Failure Handling |
|---|---|---|---|
| AuthenticationController | Login request handling | Auth service, counter, audit sink | Generic errors and safe logging |
| RateLimitPolicy | Threshold and window decision | Counter and clock | Fail closed only if policy storage reliable |

## Relationships

| Source | Relationship | Target | Reason |
|---|---|---|---|
| AuthenticationController | Uses | RateLimitPolicy | Check lockout before password verification |
| RateLimitPolicy | Reads/writes | LoginAttemptCounter | Enforce threshold |
| AuthenticationController | Emits | SecurityAuditEvent | Audit threshold and blocked attempts |

## Multiplicity

| Relationship | Multiplicity | Constraint |
|---|---|---|
| Account identifier to counter | 1 to 0..1 active window | Expired counter is ignored |
| Lockout to account identifier | 1 active lockout per identifier | Lockout expires automatically |

## Data Flow

1. Client submits login credentials.
2. Login API normalizes identifier.
3. Rate limit policy checks active lockout.
4. Authentication verifies credentials only if not locked.
5. Failed attempt increments counter; successful login clears counter.
6. Audit event records threshold and blocked attempts.

## Failure Modes

| Failure | Cause | Handling | Test Link |
|---|---|---|---|
| False lockout | Shared identifier typo or attack | Temporary duration plus recovery guidance | TC-004 |
| User enumeration | Different errors for unknown user | Generic message for all failures | TC-006 |
| Counter persistence failure | Cache/storage outage | Log operational error and follow configured fail mode | TC-007 |
| Audit leakage | Password in logs | Structured event allowlist | TC-008 |
