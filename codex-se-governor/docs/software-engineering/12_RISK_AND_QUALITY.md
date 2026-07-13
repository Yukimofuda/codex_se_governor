# Risk And Quality Management

## Purpose

Manage risk and quality continuously instead of treating them as release-time cleanup.

## Concepts from PDF

- Risk management identifies risk types, probability, impact, mitigation, contingency, and agile risk responses.
- Quality management balances fit for purpose and good enough software.
- Visible quality and invisible quality both matter.
- Performance, reliability, security, resilience, standards, Brooks's Law, outsourcing risk, and craftsmanship affect outcomes.

## Codex Rules

- Record probability, impact, mitigation, and contingency for meaningful risks.
- Treat quality trade-offs as decisions, not accidents.
- Avoid adding people, dependencies, or outsourced components without coordination and quality risk review.
- Include resilience and recovery in design when failure matters.

## Required Outputs

- Risk register.
- Quality review in final report.
- Mitigation or contingency for high risks.

## Checklist

- [ ] Risks cover technical, project, people, dependency, security, and operational categories.
- [ ] Probability and impact are estimated.
- [ ] Mitigation and contingency are distinct.
- [ ] Quality attributes have evidence.
- [ ] Standards or compliance needs are identified.

## Anti-patterns

- Logging risks without owners or actions.
- Treating "good enough" as "untested".
- Ignoring invisible quality such as maintainability and resilience.

## Enforcement

- RISK_REGISTER
- QUALITY_ATTRIBUTE_SCENARIOS
- RELEASE_CHECKLIST
- PR checklist
