#!/usr/bin/env python3
"""Validate governor version/config consistency."""

from pathlib import Path
import re
import sys

sys.dont_write_bytecode = True

from governor_config import CONFIG_PATH, is_semver, load_config, version_tag

ROOT = Path(__file__).resolve().parents[1]
README = ROOT / "README.md"
VERSIONING = ROOT / "VERSIONING.md"
PACKAGE_SCRIPT = ROOT / "scripts" / "package_release.py"


def main():
    failures = []
    if not CONFIG_PATH.exists():
        failures.append("missing governor.toml")
    else:
        config = load_config()
        if config["name"] != "codex-se-governor":
            failures.append("governor name must be codex-se-governor")
        if not is_semver(config["version"]):
            failures.append("version must follow semver")
            expected_tag = ""
        else:
            expected_tag = f"v{config['version']}"
            expected_archive = f"dist/codex-se-governor-{expected_tag}.zip"
            if config["release_archive"] != expected_archive:
                failures.append(f"release archive path mismatch: expected {expected_archive}")
            expected_source = f"dist/codex-se-governor-source-{expected_tag}.zip"
            if config["source_archive"] != expected_source:
                failures.append(f"source archive path mismatch: expected {expected_source}")
            expected_alias = f"dist/codex-se-governor-{version_tag(config['version'])}.zip"
            if config.get("compatibility_archive") != expected_alias:
                failures.append(f"compatibility archive path mismatch: expected {expected_alias}")
        readme_text = README.read_text(encoding="utf-8") if README.exists() else ""
        versioning_text = VERSIONING.read_text(encoding="utf-8") if VERSIONING.exists() else ""
        if expected_tag and expected_tag not in readme_text:
            failures.append(f"README missing version tag: {expected_tag}")
        if expected_tag and expected_tag not in versioning_text:
            failures.append(f"VERSIONING missing version tag: {expected_tag}")
        script_text = PACKAGE_SCRIPT.read_text(encoding="utf-8") if PACKAGE_SCRIPT.exists() else ""
        if re.search(r"codex-se-governor-v0\.5\.zip", script_text):
            failures.append("package_release.py still hardcodes old archive name")
        if "load_config" not in script_text:
            failures.append("package_release.py must load governor config")
        required_timeouts = {"fast_timeout_seconds", "standard_timeout_seconds", "release_timeout_seconds", "validator_timeout_seconds"}
        missing_timeouts = required_timeouts - set(config.get("validation", {}))
        for field in sorted(missing_timeouts):
            failures.append(f"governor validation config missing: {field}")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
