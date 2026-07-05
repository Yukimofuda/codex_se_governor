# Release Packaging Guide

## Purpose

Release archives must be produced by the project packaging script, not by Finder, Archive Utility, or a manual zip command. Manual archives on macOS can include `__MACOSX/` and `.DS_Store`, which are not source, data, documentation, tests, or governance evidence.

## Required Command Sequence

```bash
python3 scripts/run_full_validation.py
python3 scripts/package_release.py
python3 scripts/validate_release_archive.py dist/codex-se-governor-v0.7.zip
python3 scripts/validate_outer_archive.py dist/codex-se-governor-v0.7.zip
python3 scripts/validate_clean_package.py
```

## What The Package Excludes

- `.DS_Store`
- `.pytest_cache/`
- `__pycache__/`
- `*.pyc`
- `__MACOSX/`
- local virtual environments
- `dist/`
- temporary smoke-test task directories

## Release Evidence

Each release must record:

- validation command output
- archive validation result
- version or tag
- known limitations
- rollback strategy

## Failure Handling

If archive validation fails, discard the archive, run `python3 scripts/clean_artifacts.py`, rebuild with `python3 scripts/package_release.py`, and validate again.

## Outer Archive Rule

If you upload a second zip created by Finder or Archive Utility, that outer package can still be polluted by `__MACOSX/` even when the governor release archive is clean. Validate the exact uploaded zip with:

```bash
python3 scripts/validate_outer_archive.py /path/to/uploaded.zip
```

Finder-compressed outer zips are invalid release evidence.
