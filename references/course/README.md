# Course Reference

This directory contains the authoritative course source used to build and validate the governor traceability model.

## Source

- `软件工程全整理.md`
- Course: EBU6304 Software Engineering

## Governance Use

- `scripts/extract_course_outline.py` extracts numbered sections from the course source.
- `scripts/validate_course_coverage.py` verifies that extracted sections are mapped in `docs/software-engineering/19_COURSE_SECTION_COVERAGE.md`.
- `scripts/scan_for_engineering_smells.py` intentionally excludes this directory because the course text is an external reference, not governed source code.

## Update Rule

When the course source changes, rerun course outline extraction and update section coverage before merging.

