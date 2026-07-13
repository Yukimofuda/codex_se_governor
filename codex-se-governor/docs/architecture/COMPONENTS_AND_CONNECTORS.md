# Components And Connectors

## Components

| Component | Responsibility | Primary Files |
|---|---|---|
| Lifecycle rules | Define mandatory Codex workflow | `AGENTS.md`, Skill |
| SE canon | Preserve PDF-derived engineering rules | `docs/software-engineering/`, Skill references |
| Templates | Capture reusable lifecycle evidence | `templates/*.md` |
| Validators | Enforce structure and adoption | `scripts/*.py` |
| CI integration | Run checks on pull requests | `.github/workflows/se-quality-gate.yml` |
| Review surface | Collect human evidence | PR and issue templates |
| Example workflow | Demonstrate end-to-end task | `examples/example_feature_task/` |
| Tests | Verify script behavior | `tests/test_scripts.py` |

## Connectors

| Connector | Source | Target | Contract |
|---|---|---|---|
| Codex loading | Codex | `AGENTS.md` and Skill | Must read before non-trivial tasks |
| Template generation | `generate_task_scaffold.py` | `templates/` and `tasks/` | Copies canonical task files |
| CI execution | GitHub Actions | `scripts/` and tests | Runs validators and pytest |
| Smell triage | scanner | baseline | Every warning must be triaged |
| Adoption check | source governor | target repo | Required files must exist |

## Failure Modes

- Missing copied file: detected by `check_adoption.py`.
- Template field drift: detected by `validate_templates.py`.
- Docs structure drift: detected by `validate_doc_structure.py`.
- Skill drift: detected by `validate_skill.py`.
- Warning fatigue: controlled by smell baseline.

