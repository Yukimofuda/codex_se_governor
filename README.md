# codex-se-governor

`codex-se-governor` is a Software Engineering Lifecycle Governor for Codex. It is not a normal coding style guide, not a prompt collection, and not a course summary. It turns the EBU6304 Software Engineering lifecycle into reusable rules, templates, scripts, PR checks, CI gates, and a Codex Skill.

The goal is to force every non-trivial Codex software task through requirements, analysis, design, implementation, testing, security, documentation, review, maintenance, and retrospective thinking before code is treated as complete.

## Why Prompt Discipline Is Not Enough

Codex can generate plausible code quickly, but prompt intent alone does not guarantee requirement traceability, security review, test adequacy, architecture fit, or rollback thinking. This project externalizes those expectations into repository artifacts that can be loaded, reviewed, versioned, and checked.

## How the PDF Became a Governance System

The course chapters were mapped into enforceable artifacts:

- Software and quality become quality attributes, final report sections, and review criteria.
- Process and agile become lifecycle rules, task scaffolds, and iteration discipline.
- Requirements, stories, analysis, and design become templates and PR checklist items.
- Implementation, testing, secure development, SOLID, and patterns become review gates and smell checks.
- Project management, risk, ethics, AI, and revision become risk registers, security review, AI guardrails, and retrospective prompts.

See [docs/software-engineering/18_TRACEABILITY_MATRIX.md](docs/software-engineering/18_TRACEABILITY_MATRIX.md) for topic-level coverage, [docs/software-engineering/19_COURSE_SECTION_COVERAGE.md](docs/software-engineering/19_COURSE_SECTION_COVERAGE.md) for full numbered course section coverage, and [docs/software-engineering/20_COURSE_SEMANTIC_COVERAGE.md](docs/software-engineering/20_COURSE_SEMANTIC_COVERAGE.md) for semantic coverage clusters.

## Course Reference Handling

The authoritative course source is stored under `references/course/软件工程全整理.md`. It is treated as a reference input, not project source code. `scan_for_engineering_smells.py` skips `references/course/` so course examples and long-form study text do not create thousands of untriaged engineering smell warnings. `governance_metrics.py` counts course reference files and lines separately.

Use:

```bash
python3 scripts/extract_course_outline.py
python3 scripts/validate_course_outline_lock.py
python3 scripts/validate_course_coverage.py
python3 scripts/validate_course_semantic_coverage.py
```

The first command extracts numbered sections as JSON. The outline lock prevents accidental extractor drift. The coverage validators check both numeric section coverage and semantic engineering coverage.

## Adopt in an Existing GitHub Repository

1. Copy `AGENTS.md`, `docs/`, `templates/`, `.agents/`, `scripts/`, `.github/`, and `.pre-commit-config.yaml` into the target repository.
2. Ask Codex to read `AGENTS.md` before any non-trivial task.
3. Use `python scripts/generate_task_scaffold.py "<task-name>"` for feature, bug, refactor, architecture, or security tasks.
4. Run `python scripts/se_gate.py` before opening a PR.
5. Keep the GitHub PR template and CI workflow enabled.

## AGENTS.md

`AGENTS.md` is the highest local rule file. It defines Codex as a software engineering execution agent, not a code generator. It requires context loading, requirements, stories, analysis, design, risk, implementation, testing, security, documentation, final reporting, and memory update suggestions.

## Codex Skill

The Skill lives at `.agents/skills/software-engineering-governor/SKILL.md`. For every non-trivial implementation, bug fix, refactor, test, security review, PR review, or maintenance task, load the Skill and its references before editing.

## Templates

Templates under `templates/` can be copied into real projects or generated into `tasks/<task-name>/`. They preserve traceability from requirements to tests, risk, security review, release, and final report.

v0.4 adds templates for project context classification, process decision records, requirements elicitation evidence, glossary terms, test strategy, and architecture scenarios:

- `PROJECT_CONTEXT_TEMPLATE.md`
- `PROCESS_DECISION_TEMPLATE.md`
- `REQUIREMENTS_ELICITATION_LOG.md`
- `GLOSSARY_TEMPLATE.md`
- `TEST_STRATEGY_TEMPLATE.md`
- `ARCHITECTURE_SCENARIO_TEMPLATE.md`

## GitHub PR Template

The PR template requires evidence for requirement trace, user story, acceptance criteria, analysis, design, SOLID, implementation quality, testing, security, documentation, risk, rollback, commands run, and final review decision.

## CI Gate

`.github/workflows/se-quality-gate.yml` checks that governance files exist, installs pytest when tests are present, runs `scripts/run_full_validation.py`, and performs a release package smoke check.

## Automated Tests

This project supports pytest for script-level automated tests. Prefer the full ordered validation command before changing or packaging the governor:

```bash
python3 scripts/run_full_validation.py
```

For focused local debugging, individual validators remain available:

```bash
python3 scripts/se_gate.py
python3 scripts/validate_pr_checklist.py
python3 scripts/validate_traceability.py
python3 scripts/validate_doc_structure.py
python3 scripts/validate_templates.py
python3 scripts/validate_skill.py
python3 scripts/validate_smell_baseline.py
python3 scripts/validate_clean_package.py
python3 scripts/extract_course_outline.py
python3 scripts/validate_course_outline_lock.py
python3 scripts/validate_course_coverage.py
python3 scripts/validate_course_semantic_coverage.py
python3 scripts/validate_glossary.py
python3 scripts/validate_test_strategy.py
python3 scripts/validate_test_traceability.py
python3 scripts/validate_complexity_thresholds.py
python3 scripts/complexity_report.py
python3 scripts/test_matrix_coverage_report.py
python3 scripts/validate_architecture_scenarios.py
python3 scripts/validate_project_management.py
python3 scripts/validate_ai_review_template.py
python3 scripts/validate_process_compliance_template.py
python3 scripts/validate_maintenance_docs.py
python3 scripts/governance_metrics.py
python3 scripts/check_adoption.py .
python3 scripts/scan_for_engineering_smells.py
python3 -m pytest
```

The tests exercise normal and failure paths for the governance scripts, including missing artifacts, dangerous text detection, malformed PR templates, incomplete traceability, scaffold generation, bad arguments, smell warnings, clean package validation, course coverage, semantic coverage, outline lock, no-side-effect validation, release archive validation, test traceability, complexity thresholds, glossary validation, test strategy validation, architecture scenarios, project management, AI review evidence, maintenance docs, and metrics fields.

For pytest without retained cache artifacts, use:

```bash
python3 scripts/run_tests_clean.py
```

## Governance Metrics

Use metrics to review governor health without turning every warning into an immediate failure:

```bash
python3 scripts/governance_metrics.py
```

The command prints JSON with document, template, script, test, workflow, traceability, smell, static pytest discovery, cache artifact, course reference, numeric and semantic course coverage, clean package, outline lock, no-side-effect, release archive validator, test traceability, complexity baseline, AI example, process compliance, maturity report, task artifact validation, traceability graph, AI review score, mutation plan, deployment/maintenance templates, clean test wrapper, and validator counts.

## No-side-effect Validation

Use this wrapper when a command should not leave generated artifacts behind:

```bash
python3 scripts/validate_no_side_effects.py -- python3 scripts/governance_metrics.py
```

It compares generated artifact state before and after the command and fails on new `.pytest_cache/`, `__pycache__/`, `*.pyc`, `.DS_Store`, or `__MACOSX/`.

## Clean Package Validation

Remove generated local artifacts before packaging or committing:

```bash
python3 scripts/clean_artifacts.py
python3 scripts/validate_clean_package.py
```

The cleanup script only removes `.DS_Store`, `.pytest_cache/`, `__pycache__/`, `*.pyc`, `__MACOSX/`, and temporary smoke-test directories. It must not remove source, docs, tests, templates, examples, or course references.

## Release Packaging

Build and validate a clean v0.7 release archive:

```bash
python3 scripts/package_release.py
python3 scripts/validate_release_archive.py dist/codex-se-governor-v0.7.zip
python3 scripts/validate_outer_archive.py dist/codex-se-governor-v0.7.zip
```

The archive excludes macOS archive artifacts, cache directories, pyc files, local virtual environments, logs, dist output, and temporary smoke-test directories.

Do not create release zips with Finder or a manual macOS archive operation. Use [docs/release/RELEASE_PACKAGING_GUIDE.md](docs/release/RELEASE_PACKAGING_GUIDE.md) so `__MACOSX/`, `.DS_Store`, cache directories, and pyc files are excluded and verified. If you wrap the release archive in another uploaded zip, validate that exact outer zip too.

## Smell Baseline Workflow

`python3 scripts/scan_for_engineering_smells.py` is warning-only. `docs/quality/SMELL_BASELINE.md` classifies current warnings as `accepted`, `fixed`, `false positive`, or `needs follow-up`. Run:

```bash
python3 scripts/validate_smell_baseline.py
```

New untriaged warnings fail the validator until reviewed.

For stale or drifting entries, also run:

```bash
python3 scripts/validate_smell_baseline_sync.py
```

## Architecture And Project Management Docs

The governor documents its own structure under `docs/architecture/` using 4+1 views, components/connectors, quality trade-offs, and ADR index. Project planning lives under `docs/project-management/` with roadmap, milestones, release plan, and project risk register.

Architecture scenarios are captured with `templates/ARCHITECTURE_SCENARIO_TEMPLATE.md` and validated by `scripts/validate_architecture_scenarios.py`. Project management completeness is validated by `scripts/validate_project_management.py`.

## Glossary And Requirements Evidence

Use `docs/GLOSSARY.md` and `templates/GLOSSARY_TEMPLATE.md` to prevent ambiguous domain terms from drifting across requirements, analysis, design, tests, and PR review. Use `templates/REQUIREMENTS_ELICITATION_LOG.md` to record background reading, interviews, observation, document analysis, questionnaires, evidence, assumptions, confidence, open questions, and produced requirement IDs.

## Testing Governance

`templates/TEST_STRATEGY_TEMPLATE.md` covers verification testing, defect testing, unit/integration/system/acceptance levels, black-box and white-box techniques, equivalence partitioning, boundary testing, regression, coverage, cyclomatic complexity, TDD, mutation testing, test oracle, and pass/fail criteria.

Use:

```bash
python3 scripts/validate_test_strategy.py
python3 scripts/validate_test_traceability.py
python3 scripts/complexity_report.py
python3 scripts/validate_complexity_thresholds.py
python3 scripts/test_matrix_coverage_report.py
python3 scripts/validate_mutation_testing_plan.py
```

`validate_test_traceability.py` checks the example task maps FR/NFR and acceptance criteria to tests. `validate_complexity_thresholds.py` enforces a default complexity threshold with documented exceptions in `docs/quality/COMPLEXITY_BASELINE.md`, including owner, rationale, review date, target version, issue/follow-up ID, and trend. `templates/MUTATION_TESTING_PLAN.md` records mutation scope, score target, equivalent mutants, surviving mutants, and test improvement action.

The test suite is split into `tests/unit/`, `tests/integration/`, and `tests/e2e/`. Use:

```bash
python3 scripts/run_tests_clean.py
python3 scripts/validate_test_performance.py
```

`run_tests_clean.py` disables pytest cache, measures elapsed time, removes generated artifacts, and revalidates the package afterward.

## Adoption Checker

Check whether another repository has copied the core governor files:

```bash
python3 scripts/check_adoption.py /path/to/target/repo
```

The checker prints `PASS` or lists missing adoption files.

## AI Usage Review

Use `templates/AI_USAGE_REVIEW_TEMPLATE.md` when AI contributed code, tests, design, review, or security reasoning. Task scaffolds now include `AI_USAGE_REVIEW.md`. The PR template requires evidence for human review, security-sensitive areas, privacy-sensitive areas, IP/license risk, bias/fairness risk, hallucination risk, tests added, and final human decision.

Validate AI review evidence with:

```bash
python3 scripts/validate_ai_review_template.py
python3 scripts/ai_review_score.py
python3 scripts/validate_ai_review_evidence.py
```

`ai_review_score.py` emits JSON scores for example and task AI review files. `validate_ai_review_evidence.py` fails when required evidence drops below the minimum score.

For broader lifecycle completeness, use:

```bash
python3 scripts/evidence_package_score.py
python3 scripts/validate_evidence_package.py
```

## Process Compliance

Use `templates/PROCESS_COMPLIANCE_REPORT.md` or the generated task `PROCESS_COMPLIANCE_REPORT.md` to record selected process model, requirement stability, project risk, agile iteration evidence, documentation level, test timing, stakeholder feedback loop, release cadence, and retrospective evidence.

Validate it with:

```bash
python3 scripts/validate_process_compliance_template.py
```

Generated task scaffolds also include `DEPLOYMENT_PLAN.md` and `MAINTENANCE_TASK.md` so release and maintenance evidence are not postponed until after implementation.

## Maintenance Docs

v0.4 adds release and maintenance artifacts:

- `CHANGELOG.md`
- `VERSIONING.md`
- `MAINTENANCE_GUIDE.md`
- `SUPPORT_RUNBOOK.md`
- `DEPRECATION_POLICY.md`

Validate them with `python3 scripts/validate_maintenance_docs.py`.

## Semantic Coverage And Maturity Gates

v0.7 adds semantic density scoring and governance maturity gating:

```bash
python3 scripts/semantic_coverage_score.py
python3 scripts/validate_semantic_coverage_score.py
python3 scripts/generate_governance_maturity_report.py
python3 scripts/validate_governance_maturity.py
```

Use `docs/software-engineering/20_COURSE_SEMANTIC_COVERAGE.md` for concrete engineering-rule clusters and `docs/reports/GOVERNANCE_MATURITY_REPORT.md` for a 1-5 maturity snapshot across lifecycle areas.

## Governor Configuration

`governor.toml` is the source of truth for project name, semantic version, and release archive path.

```bash
python3 scripts/validate_governor_config.py
```

The release archive name must match the configured version.

## Cleanup Rules

Do not commit local runtime artifacts. `.gitignore` excludes `.pytest_cache/`, `__pycache__/`, `*.pyc`, `.DS_Store`, local virtual environments, temporary task scaffolds, and logs.

## Pre-commit

The pre-commit config runs the full ordered validation sequence:

```bash
python3 scripts/run_full_validation.py
```

## v0.4 Validation Scope

v0.4 hardens the governor from measurable governance into full course-section-aligned governance:

- full numbered course section coverage
- course reference isolation
- clean package validation
- project context classification
- process decision records
- requirements elicitation evidence
- glossary validation
- test strategy, complexity, and test matrix coverage checks
- architecture scenario validation
- project management validation
- AI review evidence validation
- maintenance and release documentation

v0.3 previously added:

- subtopic-level course traceability
- documentation structure validation
- template field validation
- Skill quality validation
- smell warning baseline validation
- governance metrics JSON
- architecture and project management self-documentation
- AI usage review evidence
- cross-repository adoption checking

## v0.5 Validation Scope

v0.5 hardens the governor from full section-number coverage into semantic, release-ready governance:

- semantic course coverage clusters with concrete Codex rules, artifacts, enforcement methods, depth, evidence, and limitations
- course outline lock to detect accidental extractor drift
- side-effect-aware command validation
- ordered full validation orchestrator
- clean release archive packaging and validation
- test traceability from FR/NFR and acceptance criteria to tests
- complexity threshold governance with a documented baseline
- AI usage and process compliance evidence in generated task scaffolds
- stronger residual-risk, trigger, detection, cadence, owner, and status fields
- stricter project-management evidence checks

## v0.6 Validation Scope

v0.6 hardens the governor from v0.5 semantic coverage into evidence-grade governance:

- semantic course coverage expands to at least 40 concrete clusters and is validated for artifact paths, enforcement methods, coverage depth, and section-title alignment
- `run_tests_clean.py` runs pytest with cache disabled and validates a clean package afterward
- `validate_task_artifacts.py` checks generated task lifecycle files when `tasks/` exists
- `validate_traceability_graph.py` checks requirement, acceptance, risk, security, test, final report, and rollback links
- `ai_review_score.py` and `validate_ai_review_evidence.py` score AI review evidence
- complexity baseline entries now require owner, rationale, refactoring/test obligation, review date, target version, issue/follow-up ID, and trend
- `templates/MUTATION_TESTING_PLAN.md`, `DEPLOYMENT_PLAN_TEMPLATE.md`, and `MAINTENANCE_TASK_TEMPLATE.md` extend testing, release, and maintenance governance
- `generate_governance_maturity_report.py` produces `docs/reports/GOVERNANCE_MATURITY_REPORT.md`
- `docs/release/RELEASE_PACKAGING_GUIDE.md` documents clean archive creation and validation

## v0.7 Validation Scope

v0.7 hardens the governor from v0.6 evidence structure into a reliability-focused governance product:

- config-driven release archive naming via `governor.toml`
- smell baseline sync validation, including stale-entry detection
- semantic coverage scoring with a minimum threshold
- evidence package scoring across examples and generated tasks
- governance maturity gating across lifecycle areas
- outer archive validation for uploaded zip files
- test architecture split into unit, integration, and e2e layers
- performance-aware clean pytest wrapper

## v0.4 Validation Command Sequence

```bash
python3 scripts/clean_artifacts.py
python3 scripts/validate_clean_package.py
python3 scripts/se_gate.py
python3 scripts/validate_pr_checklist.py
python3 scripts/validate_traceability.py
python3 scripts/validate_doc_structure.py
python3 scripts/validate_templates.py
python3 scripts/validate_skill.py
python3 scripts/validate_smell_baseline.py
python3 scripts/extract_course_outline.py
python3 scripts/validate_course_coverage.py
python3 scripts/validate_glossary.py
python3 scripts/validate_test_strategy.py
python3 scripts/complexity_report.py
python3 scripts/test_matrix_coverage_report.py
python3 scripts/validate_architecture_scenarios.py
python3 scripts/validate_project_management.py
python3 scripts/validate_ai_review_template.py
python3 scripts/validate_maintenance_docs.py
python3 scripts/governance_metrics.py
python3 scripts/check_adoption.py .
python3 scripts/scan_for_engineering_smells.py
python3 -m pytest
```

## v0.5 Validation And Release Sequence

```bash
python3 scripts/run_full_validation.py
python3 scripts/package_release.py
python3 scripts/validate_release_archive.py dist/codex-se-governor-v0.5.zip
python3 scripts/governance_metrics.py
python3 scripts/validate_clean_package.py
python3 -m pytest
python3 scripts/clean_artifacts.py
python3 scripts/validate_clean_package.py
```

## v0.6 Validation And Release Sequence

Use this sequence for normal development and release evidence:

```bash
python3 scripts/run_full_validation.py
python3 scripts/run_tests_clean.py
python3 scripts/validate_clean_package.py
python3 scripts/validate_course_semantic_coverage.py
python3 scripts/validate_task_artifacts.py
python3 scripts/validate_traceability_graph.py
python3 scripts/ai_review_score.py
python3 scripts/validate_ai_review_evidence.py
python3 scripts/generate_governance_maturity_report.py
python3 scripts/governance_metrics.py
python3 scripts/package_release.py
python3 scripts/validate_release_archive.py dist/codex-se-governor-v0.5.zip
python3 scripts/validate_clean_package.py
```

## v0.7 Validation And Release Sequence

Use this sequence for current development and release evidence:

```bash
python3 scripts/run_full_validation.py
python3 scripts/run_tests_clean.py
python3 scripts/validate_clean_package.py
python3 scripts/semantic_coverage_score.py
python3 scripts/validate_semantic_coverage_score.py
python3 scripts/evidence_package_score.py
python3 scripts/validate_evidence_package.py
python3 scripts/generate_governance_maturity_report.py
python3 scripts/validate_governance_maturity.py
python3 scripts/validate_governor_config.py
python3 scripts/package_release.py
python3 scripts/validate_release_archive.py dist/codex-se-governor-v0.7.zip
python3 scripts/validate_outer_archive.py dist/codex-se-governor-v0.7.zip
python3 scripts/governance_metrics.py
```

## Loading Standard Before Development

At the start of a non-trivial task, Codex must read:

1. `AGENTS.md`
2. `.agents/skills/software-engineering-governor/SKILL.md`
3. The referenced canon, checklist, decision rules, anti-patterns, and traceability matrix
4. The task scaffold files if present

## Limitations

The scripts are intentionally conservative and lightweight. They detect missing governance artifacts and obvious smells, but they do not prove correctness, security, fairness, architecture quality, or test sufficiency. Human review remains required.

## Future Improvements

- Add language-specific adapters for Java, Python, TypeScript, and web security checks.
- Add coverage importers for common CI systems.
- Add ADR consistency checks.
- Add dependency and license scanners when projects allow third-party tools.
- Add stronger task-to-test traceability validation.
