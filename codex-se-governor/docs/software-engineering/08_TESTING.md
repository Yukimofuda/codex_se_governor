# Testing

## Purpose

Use testing to verify requirements, expose defects, and protect regression behavior.

## Concepts from PDF

- Verification testing checks whether requirements are met.
- Defect testing tries to reveal faults.
- Levels include unit, integration, system, and acceptance testing.
- Test design uses black-box, white-box, equivalence partitioning, boundary testing, and regression testing.
- Coverage concepts include statement, branch, condition, path coverage, cyclomatic complexity, TDD, mutation testing, and test matrices.

## Codex Rules

- Link tests to requirement or acceptance IDs.
- Include normal, boundary, invalid, failure, security, and regression paths where relevant.
- Use unit tests for local logic, integration tests for contracts, acceptance tests for user-visible behavior.
- State coverage limits; do not claim exhaustive testing.
- For complex branching, inspect cyclomatic complexity and branch coverage needs.

## Required Outputs

- Test plan or test matrix for non-trivial work.
- New/updated tests or explicit residual risk.
- Commands run and results.

## Checklist

- [ ] Test levels chosen deliberately.
- [ ] Black-box cases cover input partitions and boundaries.
- [ ] White-box cases cover branches or conditions where risk demands it.
- [ ] Regression cases protect existing behavior.
- [ ] Failure paths are tested.
- [ ] Test data is documented.

## Anti-patterns

- Only testing the happy path.
- Treating manual observation as complete verification.
- Updating tests to match wrong behavior without requirement review.

## Enforcement

- TEST_PLAN_TEMPLATE
- TEST_CASE_MATRIX
- PR checklist
- CI
