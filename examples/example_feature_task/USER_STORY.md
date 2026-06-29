# User Story: Login Failure Rate Limit

## Epic

- Epic ID: AUTH-SECURITY
- Epic goal: Improve account protection against automated attacks.

## Story

As an account holder, I want repeated failed login attempts to be limited, so that attackers cannot keep guessing my password indefinitely.

## Priority

- MoSCoW: Must
- Business value: Reduces account takeover risk.
- Risk reduction: High security value with moderate usability trade-off.

## Story Points

- Fibonacci estimate: 5
- Uncertainty: Counter storage and lockout expiry behavior.

## INVEST Checklist

- [x] Independent
- [x] Negotiable
- [x] Valuable
- [x] Estimable
- [x] Small
- [x] Testable

## Acceptance Criteria

```gherkin
Given an account has four failed login attempts in the current window
When the next login attempt uses an invalid password
Then the account identifier is temporarily locked
```

```gherkin
Given an account is temporarily locked
When a login attempt is made during the lockout
Then the response is a generic retry-later message
```

```gherkin
Given an account has failed attempts below threshold
When the user logs in successfully
Then failed attempts are cleared
```

## Tasks

| Task ID | Task | Status |
|---|---|---|
| T-001 | Add rate-limit policy constants/config | Planned |
| T-002 | Add attempt counter service | Planned |
| T-003 | Integrate counter into login workflow | Planned |
| T-004 | Add unit, integration, regression, and security tests | Planned |
| T-005 | Update security review and docs | Planned |
