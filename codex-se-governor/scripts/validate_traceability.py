#!/usr/bin/env python3
"""Validate traceability matrix covers all 17 main PDF chapters."""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
MATRIX = ROOT / "docs" / "software-engineering" / "18_TRACEABILITY_MATRIX.md"

CHAPTERS = [
    "1. Software Engineering Introduction",
    "2. Agile Software Development",
    "3. Requirements",
    "4. User Stories and Prototyping",
    "5. Analysis",
    "6. Design",
    "7. Implementation",
    "8. Testing",
    "9. Software Architecture",
    "10. Project Management",
    "11. Ethics and AI",
    "12. Risk and Quality Management",
    "13. Secure Development",
    "14. Design Principles",
    "15. Design Patterns",
    "16. AI Assisted Development",
    "17. Revision",
]

SUBTOPICS = [
    "software = programs + data + documentation",
    "user/developer quality attributes",
    "quality/process/method/tool layered model",
    "waterfall vs agile",
    "frequent integration and small releases",
    "functional vs non-functional requirements",
    "verifiable NFRs",
    "requirement conflicts",
    "user stories",
    "acceptance criteria",
    "INVEST",
    "MoSCoW",
    "ROI",
    "story points",
    "prototyping fidelity",
    "EBC analysis",
    "class relationships and multiplicity",
    "encapsulation",
    "abstraction",
    "coupling",
    "cohesion",
    "modularity",
    "refactoring",
    "code smells",
    "version control",
    "code review",
    "CI",
    "documentation",
    "black-box testing",
    "white-box testing",
    "boundary testing",
    "regression testing",
    "coverage",
    "TDD",
    "mutation testing",
    "4+1 architecture view",
    "layered architecture",
    "MVC",
    "REST constraints",
    "distributed/cloud/load balancing",
    "project planning",
    "milestones",
    "critical path",
    "Gantt chart",
    "stakeholder engagement",
    "fairness",
    "bias",
    "statistical parity",
    "predictive equality",
    "accountability",
    "data protection",
    "risk probability/impact",
    "contingency",
    "fit for purpose",
    "visible/invisible quality",
    "resilience",
    "secure AI coding workflow",
    "static analysis",
    "manual review",
    "error handling testing",
    "SRP",
    "OCP",
    "LSP",
    "ISP",
    "DIP",
    "Facade",
    "Observer",
    "Proxy",
    "Singleton",
    "Strategy",
    "Factory",
    "Adapter",
    "Least Knowledge",
    "pattern misuse and over-design",
    "AI guardrails",
    "human oversight",
    "low-risk high-value AI adoption",
    "course source integrity",
]


def main():
    if not MATRIX.exists():
        print("FAIL missing traceability matrix")
        return 1
    text = MATRIX.read_text(encoding="utf-8")
    missing = [chapter for chapter in CHAPTERS if chapter not in text]
    missing.extend(f"subtopic: {subtopic}" for subtopic in SUBTOPICS if subtopic not in text)
    if missing:
        print("FAIL")
        for chapter in missing:
            print(f"- missing chapter: {chapter}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
