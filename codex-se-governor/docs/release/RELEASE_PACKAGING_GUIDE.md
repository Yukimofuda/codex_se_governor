# Release Packaging Guide

## Purpose

Source and release archives must be produced by project scripts. Finder, Archive Utility, and manually wrapped outer zips are invalid because they can add `__MACOSX/`, `.DS_Store`, or mojibake filenames.

## Distribution Types

| Type | Authoritative path | Purpose |
|---|---|---|
| Exact release | `dist/codex-se-governor-v0.7.2.zip` | Immutable release artifact |
| Compatibility alias | `dist/codex-se-governor-v0.7.zip` | Optional convenience copy |
| Source archive | `dist/codex-se-governor-source-v0.7.2.zip` | Editable source, tests, docs, templates, course Markdown |

## Required Command Sequence

```bash
python3 scripts/run_full_validation.py --release
python3 scripts/package_source.py
python3 scripts/validate_release_archive.py dist/codex-se-governor-v0.7.2.zip
python3 scripts/validate_outer_archive.py dist/codex-se-governor-v0.7.2.zip
python3 scripts/validate_source_archive.py dist/codex-se-governor-source-v0.7.2.zip
python3 scripts/validate_clean_package.py
```

## Release Manifest

`dist/RELEASE_MANIFEST.json` records the governor version, each declared archive path, presence state, and SHA-256. Packaging or validation fails if another `dist/*.zip` is present but undeclared.

## Package Exclusions

- `.DS_Store`, `__MACOSX/`, pytest/bytecode caches, local environments, logs
- the complete `dist/` directory, preventing archive recursion
- temporary smoke task directories

## UTF-8 Requirements

Both canonical archives must contain `codex-se-governor/references/course/软件工程全整理.md`. Validators reject the known mojibake alternative and verify that the source archive contains exactly one project root.

## Failure Handling

Delete only stale generated distributions identified by the validator, rerun the scripted packaging sequence, and validate the exact file that will be uploaded. Never repair a generated archive by manually editing or recompressing it.
