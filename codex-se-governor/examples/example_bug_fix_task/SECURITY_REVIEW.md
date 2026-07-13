# Security Review: Login Failure Counter Bug Fix

## Threat Model

Primary threat is online brute-force or credential stuffing against login endpoints.

## Trust Boundaries

- Public client to login API.
- Login API to authentication service.
- Login flow to counter store.
- Login flow to audit sink.

## Input Validation

Normalize account identifiers consistently. Reject malformed identifiers using the existing login validation path.

## Authentication

Password verification remains in the existing authentication service and is not weakened.

## Authorization

No authorization decision is added; limiter only controls authentication attempts.

## Secrets

Passwords and tokens must never be logged or stored in counter/audit records.

## Error Handling

All failed login states use generic responses that do not reveal whether an account exists.

## Logging

Audit events include identifier hash or safe account reference, event type, timestamp, and source metadata only.

## Dependency Risk

Counter store should use existing infrastructure where possible. New dependency requires review.

## AI-generated Code Risk

Generated code must be reviewed for enumeration, unsafe logging, missing expiry, race conditions, and incorrect threshold logic.

## Deployment Risk

Use feature flag or config toggle. Monitor lockout rates after release.

## Residual Risk

Temporary lockout can still be abused; monitoring and recovery process are required.

## Risk Links

- R-001: Lockout abuse is covered by generic error handling, recovery guidance, and support monitoring.
- R-002: Counter store outage is covered by deployment monitoring and feature-flag rollback.
- R-003: Account enumeration is covered by generic responses and security tests.
- R-004: Hard-coded policy values are covered by design review and config-driven thresholds.
