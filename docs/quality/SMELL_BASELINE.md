# Smell Baseline

This baseline makes static-analysis warnings reviewable. A warning may be accepted only with a reason and owner. New warnings must be triaged before merge.

| Path | Message | Status | Owner | Rationale / Follow-up | Review date | Target version |
|---|---|---|---|---|---|---|
| scripts/scan_for_engineering_smells.py | TODO/FIXME | accepted | governor-maintainer | The scanner intentionally names the marker class it detects. | 2026-07-05 | v0.8 |
| scripts/se_gate.py | TODO/FIXME | accepted | governor-maintainer | The gate intentionally lists a dangerous-text phrase split in source. | 2026-07-05 | v0.8 |
| templates/USER_STORY_TEMPLATE.md | TODO/FIXME | accepted | governor-maintainer | Template uses task placeholders; review if future scanner supports template-aware suppression. | 2026-07-05 | v0.8 |
| .agents/skills/software-engineering-governor/scripts/checklist_report.py | repeated large string appears 4 or more times | obsolete | governor-maintainer | Scanner now excludes the tiny wrapper because it is not a governed source file and produced stale noise. | 2026-07-08 | v0.7 |
