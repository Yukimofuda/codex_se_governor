#!/usr/bin/env python3
"""Validate the authoritative course source against its accepted content lock."""

from pathlib import Path
import hashlib
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
LOCK = ROOT / "docs" / "software-engineering" / "COURSE_SOURCE_LOCK.json"
OUTLINE_LOCK = ROOT / "docs" / "software-engineering" / "COURSE_OUTLINE_LOCK.json"
EXPECTED_SOURCE = "references/course/软件工程全整理.md"
REQUIRED_FIELDS = {
    "schema_version",
    "source",
    "sha256",
    "byte_count",
    "newline_count",
    "course_section_count",
    "origin",
}


def validate_source(lock):
    failures = []
    source_value = lock.get("source", "")
    if source_value != EXPECTED_SOURCE:
        failures.append(f"course source path must be {EXPECTED_SOURCE}: got {source_value}")
    source = ROOT / source_value if isinstance(source_value, str) else ROOT / "__invalid_source__"
    if not source.is_file():
        failures.append(f"course source missing: {source_value}")
    else:
        content = source.read_bytes()
        actual = {
            "sha256": hashlib.sha256(content).hexdigest(),
            "byte_count": len(content),
            "newline_count": content.count(b"\n"),
        }
        for field, value in actual.items():
            if lock.get(field) != value:
                failures.append(f"course source {field} changed: expected {lock.get(field)}, got {value}")
    return failures


def validate_outline_count(lock):
    if not OUTLINE_LOCK.exists():
        return ["missing docs/software-engineering/COURSE_OUTLINE_LOCK.json"]
    try:
        section_count = len(json.loads(OUTLINE_LOCK.read_text(encoding="utf-8")))
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        return [f"invalid course outline lock: {exc}"]
    if lock.get("course_section_count") != section_count:
        return [
            "course source section count does not match outline lock: "
            f"expected {lock.get('course_section_count')}, got {section_count}"
        ]
    return []


def main():
    if not LOCK.exists():
        print("FAIL")
        print("- missing docs/software-engineering/COURSE_SOURCE_LOCK.json")
        return 1
    try:
        lock = json.loads(LOCK.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        print("FAIL")
        print(f"- invalid course source lock: {exc}")
        return 1

    missing_fields = sorted(REQUIRED_FIELDS - set(lock))
    failures = [f"course source lock missing field: {field}" for field in missing_fields]
    failures.extend(validate_source(lock))
    failures.extend(validate_outline_count(lock))

    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        print("- update COURSE_SOURCE_LOCK.json intentionally only after reviewing a course source change")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
