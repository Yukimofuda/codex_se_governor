# Ethics And AI

## Purpose

Ensure software and AI-assisted work considers fairness, bias, accountability, privacy, and professional responsibility.

## Concepts from PDF

- Bias can enter through selection bias, label bias, model bias, unconscious bias, and data limitations.
- Human and machine decisions both require accountability.
- Fairness concepts include statistical parity and predictive equality, which may conflict.
- Transparency, accountability, personal data protection, and ACM/IEEE ethics matter.

## Codex Rules

- Identify personal or sensitive data touched by a change.
- For decision systems, ask who may be harmed or excluded.
- Do not present AI output as objective truth.
- Explain limitations and human oversight where AI influences behavior.
- Preserve privacy and intellectual property boundaries.

## Required Outputs

- Ethics or privacy note when relevant.
- Security review for sensitive data.
- Human review requirement for AI-influenced decisions.

## Checklist

- [ ] Sensitive data identified.
- [ ] Bias risk considered for user-impacting decisions.
- [ ] Transparency and explainability needs considered.
- [ ] Accountability owner is clear.
- [ ] License/IP risk is reviewed for generated or copied code.

## Anti-patterns

- Assuming removing sensitive attributes removes bias.
- Automating consequential decisions without appeal or oversight.
- Using AI-generated code without review.

## Enforcement

- SECURITY_REVIEW_TEMPLATE
- CODE_REVIEW_TEMPLATE
- PR checklist
- human review
