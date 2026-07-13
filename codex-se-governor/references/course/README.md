# Course Reference

This directory contains the authoritative course source used to build and validate the governor traceability model.

## Source

- `软件工程全整理.md`
- Course: EBU6304 Software Engineering
- Original PDF: `软件工程全整理(3).pdf`, 266 pages
- PDF SHA-256: `7f74280801a24567a5361638a7a33208fa60243f3b35ba166de3da34db51761d`

## Governance Use

- `scripts/extract_course_outline.py` extracts numbered sections from the course source.
- `scripts/validate_course_source_lock.py` verifies the full source hash, byte/newline counts, and accepted section count.
- `scripts/validate_course_coverage.py` verifies that extracted sections are mapped in `docs/software-engineering/19_COURSE_SECTION_COVERAGE.md`.
- `scripts/scan_for_engineering_smells.py` intentionally excludes this directory because the course text is an external reference, not governed source code.

## Update Rule

When the course source changes, review the PDF diff first. Then intentionally update `COURSE_SOURCE_LOCK.json`, rerun course outline extraction, update the outline/coverage documents when needed, and run the full validation sequence before merging. Never refresh the lock merely to silence a failure.
