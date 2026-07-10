# Traceability Matrix

This matrix maps PDF chapters and important subtopics to governor rules, artifacts, enforcement, and validation status.

| PDF Chapter | Subtopic | Engineering Meaning | Codex Rule | Project Artifact | Enforcement Method | Validation Status |
|---|---|---|---|---|---|---|
| 1. Software Engineering Introduction | software = programs + data + documentation | Code alone is not the product | Review code, data, docs, tests, and operations impact | AGENTS.md; README.md | Final report; PR checklist | Validated |
| 1. Software Engineering Introduction | user/developer quality attributes | Quality has external and internal views | State affected quality attributes | 01_SOFTWARE_AND_QUALITY.md; QUALITY_ATTRIBUTE_SCENARIOS.md | Template review | Validated |
| 1. Software Engineering Introduction | quality/process/method/tool layered model | Tools serve quality, not the reverse | Prefer quality evidence over tool output alone | 00_OVERVIEW.md | Human review | Validated |
| 2. Agile Software Development | waterfall vs agile | Process choice depends on context and risk | Select process weight deliberately | 02_PROCESS_AND_AGILE.md | Final report | Validated |
| 2. Agile Software Development | frequent integration and small releases | Small increments expose risk early | Keep changes reversible and CI-tested | AGENTS.md; workflow | CI; PR review | Validated |
| 2. Agile Software Development | necessary documentation | Agile still needs useful docs | Update decision-critical docs | README.md; templates | PR checklist | Validated |
| 3. Requirements | functional vs non-functional requirements | Behavior and quality constraints differ | Separate FR and NFR | REQUIREMENTS_TEMPLATE.md | Template validator | Validated |
| 3. Requirements | verifiable NFRs | Quality goals need measures | Add response measure or review evidence | QUALITY_ATTRIBUTE_SCENARIOS.md | Template validator | Validated |
| 3. Requirements | requirement conflicts | Stakeholder needs can collide | Record conflict and resolution | REQUIREMENTS_TEMPLATE.md | PR checklist | Validated |
| 3. Requirements | fact-finding | Requirements need evidence | State source and assumptions | REQUIREMENTS_TEMPLATE.md | Human review | Validated |
| 4. User Stories and Prototyping | user stories | Work should express role, goal, benefit | Use story format for user-facing work | USER_STORY_TEMPLATE.md | Template validator | Validated |
| 4. User Stories and Prototyping | acceptance criteria | Stories must be testable | Use Given/When/Then and test links | ACCEPTANCE_CRITERIA_TEMPLATE.md | Template validator | Validated |
| 4. User Stories and Prototyping | INVEST | Story readiness review | Check Independent, Negotiable, Valuable, Estimable, Small, Testable | USER_STORY_TEMPLATE.md | PR checklist | Validated |
| 4. User Stories and Prototyping | MoSCoW | Priority must be explicit | Mark Must/Should/Could/Won't | USER_STORY_TEMPLATE.md | Template validator | Validated |
| 4. User Stories and Prototyping | ROI | Value and risk inform order | Explain value/risk priority | USER_STORY_TEMPLATE.md | Human review | Validated |
| 4. User Stories and Prototyping | story points | Estimate uncertainty | Use Fibonacci estimate where useful | USER_STORY_TEMPLATE.md | Human review | Validated |
| 4. User Stories and Prototyping | prototyping fidelity | Prototype effort should match uncertainty | Choose low/medium/high fidelity intentionally | 04_USER_STORIES_AND_PROTOTYPING.md | Human review | Validated |
| 4. User Stories and Prototyping | project glossary | Shared terms reduce ambiguity | Define domain terms when needed | ANALYSIS_MODEL_TEMPLATE.md | Human review | Validated |
| 5. Analysis | EBC analysis | Separate entity, boundary, and control responsibilities | Identify E/B/C objects | ANALYSIS_MODEL_TEMPLATE.md | Template validator | Validated |
| 5. Analysis | class relationships and multiplicity | Domain constraints affect design and tests | Record relationships and multiplicity | ANALYSIS_MODEL_TEMPLATE.md | Template validator | Validated |
| 5. Analysis | problem domain | Avoid coding implementation before domain understanding | List domain concepts and rules | ANALYSIS_MODEL_TEMPLATE.md | PR checklist | Validated |
| 6. Design | encapsulation | Protect invariants and hide representation | Define ownership and module boundaries | DESIGN_DOC_TEMPLATE.md | Template validator | Validated |
| 6. Design | abstraction | Separate contract from implementation | Use interfaces only for real boundaries | DESIGN_DOC_TEMPLATE.md | Code review | Validated |
| 6. Design | coupling | Reduce unnecessary dependency | Explain coupling changes | DESIGN_DOC_TEMPLATE.md | PR checklist | Validated |
| 6. Design | cohesion | Keep responsibilities focused | Review SRP and module purpose | DESIGN_DOC_TEMPLATE.md | Code review | Validated |
| 6. Design | modularity | Make change local and testable | Document module boundaries | DESIGN_DOC_TEMPLATE.md | Template validator | Validated |
| 6. Design | refactoring | Preserve behavior while improving design | Require tests or risk note | CODE_REVIEW_TEMPLATE.md | PR checklist | Validated |
| 7. Implementation | code smells | Smells require triage, not blind ignore | Run scanner and baseline new warnings | scan_for_engineering_smells.py; SMELL_BASELINE.md | Baseline validator | Validated |
| 7. Implementation | version control | Changes must be reviewable | Keep minimal reversible diffs | AGENTS.md | PR review | Validated |
| 7. Implementation | code review | Review quality, not only bugs | Use code review template | CODE_REVIEW_TEMPLATE.md | Template validator | Validated |
| 7. Implementation | CI | Automation catches regressions | Run governance and project checks | se-quality-gate.yml | CI | Validated |
| 7. Implementation | documentation | Software includes documentation | Update README/API/ops docs | README.md; templates | PR checklist | Validated |
| 8. Testing | black-box testing | Test externally visible behavior | Cover normal, invalid, boundary behavior | TEST_CASE_MATRIX.md | Template validator | Validated |
| 8. Testing | white-box testing | Structure informs branch/path cases | Record branch/condition/path coverage intent | TEST_CASE_MATRIX.md | Template validator | Validated |
| 8. Testing | boundary testing | Limits are high-risk | Include boundary rows | TEST_CASE_MATRIX.md | Template validator | Validated |
| 8. Testing | regression testing | Protect old behavior | Add regression tests for fixes | TEST_PLAN_TEMPLATE.md | PR checklist | Validated |
| 8. Testing | coverage | Coverage is evidence, not proof | Record coverage type or limitation | TEST_CASE_MATRIX.md | Human review | Validated |
| 8. Testing | TDD | Tests can drive design | Use where change is behavior-first | 08_TESTING.md | Human review | Validated |
| 8. Testing | mutation testing | Tests should detect wrong logic | Consider mutation risk or optional tool | TEST_CASE_MATRIX.md | Human review | Documented |
| 8. Testing | cyclomatic complexity | Branching increases test paths | Record complexity concern for complex logic | TEST_CASE_MATRIX.md | Smell scanner; review | Documented |
| 9. Software Architecture | 4+1 architecture view | Multiple views reveal different risks | Use logical/development/process/physical/scenario views | docs/architecture/4_PLUS_1_VIEW.md | Doc review | Validated |
| 9. Software Architecture | layered architecture | Layers isolate concerns with trade-offs | Justify layer boundaries | 09_ARCHITECTURE.md | ADR review | Validated |
| 9. Software Architecture | MVC | Separate model, view, controller concerns | Explain UI/domain/control split | 09_ARCHITECTURE.md | Design review | Documented |
| 9. Software Architecture | REST constraints | REST is constraints, not a library | Review stateless/cache/uniform/layered constraints | ARCHITECTURE_DECISION_RECORD.md | ADR review | Documented |
| 9. Software Architecture | distributed/cloud/load balancing | Deployment choices affect reliability and scale | Record operational trade-offs | QUALITY_ATTRIBUTE_SCENARIOS.md | Human review | Documented |
| 10. Project Management | project planning | Work needs visible scope and deliverables | Maintain roadmap and milestones | docs/project-management/ROADMAP.md | Human review | Validated |
| 10. Project Management | milestones | Delivery points create control | Record deliverables and evidence | docs/project-management/MILESTONES.md | Release review | Validated |
| 10. Project Management | critical path | Dependencies drive schedule risk | Identify blockers for complex work | RISK_REGISTER.md | Risk review | Documented |
| 10. Project Management | Gantt chart | Timeline visualization can help planning | Use when dependency scheduling matters | docs/project-management/MILESTONES.md | Human review | Documented |
| 10. Project Management | stakeholder engagement | Stakeholders affect requirements and acceptance | Identify source and owner | REQUIREMENTS_TEMPLATE.md | Template validator | Validated |
| 11. Ethics and AI | fairness | Software decisions can harm groups | Review fairness for consequential systems | AI_USAGE_REVIEW_TEMPLATE.md | PR checklist | Validated |
| 11. Ethics and AI | bias | Data and labels encode bias | Review bias/fairness risk | AI_USAGE_REVIEW_TEMPLATE.md | Template validator | Validated |
| 11. Ethics and AI | statistical parity | Fairness metric based on outcome rate | Choose fairness metric explicitly | 11_ETHICS_AND_AI.md | Human review | Documented |
| 11. Ethics and AI | predictive equality | Fairness metric based on conditional accuracy | Document metric trade-off | 11_ETHICS_AND_AI.md | Human review | Documented |
| 11. Ethics and AI | accountability | Human responsibility remains | Final human decision required | AI_USAGE_REVIEW_TEMPLATE.md | PR checklist | Validated |
| 11. Ethics and AI | data protection | Personal data needs privacy review | Identify privacy-sensitive areas | AI_USAGE_REVIEW_TEMPLATE.md; SECURITY_REVIEW_TEMPLATE.md | Template validator | Validated |
| 12. Risk and Quality Management | risk probability/impact | Risk needs scale and owner | Record probability, impact, exposure | RISK_REGISTER.md | Template validator | Validated |
| 12. Risk and Quality Management | contingency | Fallback differs from mitigation | Record contingency plan | RISK_REGISTER.md | Template validator | Validated |
| 12. Risk and Quality Management | fit for purpose | Quality depends on context | State acceptance and quality scenarios | QUALITY_ATTRIBUTE_SCENARIOS.md | Template validator | Validated |
| 12. Risk and Quality Management | visible/invisible quality | Internal quality matters even when hidden | Review maintainability/resilience | QUALITY_ATTRIBUTE_SCENARIOS.md | PR checklist | Validated |
| 12. Risk and Quality Management | resilience | Systems must handle faults | Add failure and recovery scenarios | TEST_CASE_MATRIX.md; RELEASE_CHECKLIST.md | Human review | Documented |
| 13. Secure Development | secure AI coding workflow | AI code requires security workflow | Prompt, review, scan, test, deploy-check | SECURITY_REVIEW_TEMPLATE.md; AI_USAGE_REVIEW_TEMPLATE.md | PR checklist | Validated |
| 13. Secure Development | static analysis | Tools assist but do not decide | Run scanner and triage warnings | scan_for_engineering_smells.py; SMELL_BASELINE.md | Baseline validator | Validated |
| 13. Secure Development | manual review | Security needs human judgment | Complete security review | SECURITY_REVIEW_TEMPLATE.md | Template validator | Validated |
| 13. Secure Development | error handling testing | Failures can leak or corrupt data | Include invalid/failure/error cases | TEST_CASE_MATRIX.md | Template validator | Validated |
| 13. Secure Development | secrets and dependencies | Credentials and libraries are attack surfaces | Scan dangerous text and review deps | se_gate.py; SECURITY_REVIEW_TEMPLATE.md | CI; PR review | Validated |
| 14. Design Principles | SRP | One reason to change | Review focused responsibility | DESIGN_DOC_TEMPLATE.md | Template validator | Validated |
| 14. Design Principles | OCP | Extend without risky modification | Use only for real variation | DESIGN_DOC_TEMPLATE.md | Code review | Validated |
| 14. Design Principles | LSP | Subtypes must be substitutable | Avoid invalid inheritance | DESIGN_DOC_TEMPLATE.md | Code review | Validated |
| 14. Design Principles | ISP | Clients need focused interfaces | Split fat interfaces | DESIGN_DOC_TEMPLATE.md | Code review | Validated |
| 14. Design Principles | DIP | Depend on stable abstractions | Invert only at meaningful boundaries | DESIGN_DOC_TEMPLATE.md | Code review | Validated |
| 15. Design Patterns | Facade | Simplify complex subsystem | Use when subsystem coupling is high | DESIGN_DOC_TEMPLATE.md | Pattern justification | Validated |
| 15. Design Patterns | Observer | Notify dependent objects | Manage lifecycle/unsubscribe | DESIGN_DOC_TEMPLATE.md | Pattern review | Validated |
| 15. Design Patterns | Proxy | Control or defer access | State access/lazy/security reason | DESIGN_DOC_TEMPLATE.md | Pattern review | Validated |
| 15. Design Patterns | Singleton | One instance with lifecycle risk | Avoid unless strongly justified | DESIGN_DOC_TEMPLATE.md | Pattern review | Validated |
| 15. Design Patterns | Strategy | Encapsulate variable algorithms | Use for real algorithm variation | DESIGN_DOC_TEMPLATE.md | Pattern review | Validated |
| 15. Design Patterns | Factory | Isolate creation variation | Use for volatile construction | DESIGN_DOC_TEMPLATE.md | Pattern review | Validated |
| 15. Design Patterns | Adapter | Bridge incompatible interfaces | Use at integration boundary | DESIGN_DOC_TEMPLATE.md | Pattern review | Validated |
| 15. Design Patterns | Least Knowledge | Reduce unnecessary coupling | Avoid deep object navigation | 15_DESIGN_PATTERNS.md | Code review | Documented |
| 15. Design Patterns | pattern misuse and over-design | Patterns can reduce quality if forced | Require problem, alternative, consequence | DESIGN_DOC_TEMPLATE.md | PR checklist | Validated |
| 16. AI Assisted Development | AI guardrails | AI output needs controls | Require tests, review, security, human decision | AI_USAGE_REVIEW_TEMPLATE.md | PR checklist | Validated |
| 16. AI Assisted Development | human oversight | AI does not own correctness | Record final human decision | AI_USAGE_REVIEW_TEMPLATE.md | Template validator | Validated |
| 16. AI Assisted Development | low-risk high-value AI adoption | Use AI where review cost is low | Prefer drafts, tests, docs, explanations | 16_AI_ASSISTED_DEVELOPMENT.md | Human review | Documented |
| 16. AI Assisted Development | hallucination risk | AI may invent facts or APIs | Verify against source, tests, docs | AI_USAGE_REVIEW_TEMPLATE.md | PR checklist | Validated |
| 17. Revision | lifecycle master review | Completion needs whole-system evidence | Run master checklist before final report | 17_REVISION_MASTER_CHECKLIST.md | Final report | Validated |
| 17. Revision | course source integrity | Traceability claims require a stable reviewed source | Reject unreviewed changes to the authoritative course text | COURSE_SOURCE_LOCK.json; scripts/validate_course_source_lock.py | CI; pre-commit; full validation | Validated |
| 17. Revision | memory and retrospective | Learning should improve future work | Propose memory/rule updates | RETROSPECTIVE_TEMPLATE.md | Template validator | Validated |
