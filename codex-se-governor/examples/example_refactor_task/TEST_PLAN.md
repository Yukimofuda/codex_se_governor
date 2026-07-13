# Test Plan: Login Failure Module Refactor

## Scope

Verify failed attempt tracking, lockout, reset on success, generic errors, audit events, and regression of valid login.

## Test Levels

- Unit: limiter policy, counter expiry, reset behavior.
- Integration: login flow with limiter and auth service.
- System: end-to-end login attempts through API.
- Acceptance: user-visible behavior and recovery message.

## Test Strategy

- Black-box: valid/invalid credentials, threshold, expiry window.
- White-box: branch coverage for allowed, failed, locked, success reset.
- Regression: existing successful login still works.
- Security: generic errors and no sensitive log data.

## Tools

Use the target project test runner; no special third-party requirement from governor.

## Test Data

- Known account: `user@example.test`
- Invalid password strings are synthetic and never logged.
- Unknown account identifier for enumeration checks.

## Traceability

| Requirement ID | Acceptance Criteria | Test ID |
|---|---|---|
| FR-001 | AC-001 | TC-001 |
| FR-002 | AC-002 | TC-002 |
| FR-003 | AC-003 | TC-003 |
| FR-004 | AC-004 | TC-006 |
| FR-005 | AC-005 | TC-008 |

## Pass/Fail Criteria

All automated tests pass and security review confirms no account enumeration or sensitive logging.

## Regression Plan

Run existing authentication tests plus new limiter matrix.
