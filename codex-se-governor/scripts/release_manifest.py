#!/usr/bin/env python3
"""Release artifact manifest creation and stale-distribution validation."""

from pathlib import Path
import hashlib
import json

from validation_result import write_json

ROOT = Path(__file__).resolve().parents[1]
HASH_BLOCK_BYTES = 1 << 20


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(HASH_BLOCK_BYTES), b""):
            digest.update(block)
    return digest.hexdigest()


def declared_artifacts(config):
    rows = [
        ("release", config["release_archive"]),
        ("source", config["source_archive"]),
    ]
    if config.get("compatibility_archive"):
        rows.insert(1, ("compatibility_alias", config["compatibility_archive"]))
    return rows


def stale_archives(config):
    declared = {relative for _kind, relative in declared_artifacts(config)}
    dist = ROOT / "dist"
    return sorted(str(path.relative_to(ROOT)) for path in dist.glob("*.zip") if str(path.relative_to(ROOT)) not in declared)


def build_manifest(config):
    artifacts = []
    for kind, relative in declared_artifacts(config):
        path = ROOT / relative
        artifacts.append(
            {
                "kind": kind,
                "path": relative,
                "sha256": sha256(path) if path.is_file() else None,
                "status": "present" if path.is_file() else "not-generated",
            }
        )
    return {
        "schema_version": 1,
        "governor_version": config["version"],
        "artifacts": artifacts,
    }


def write_manifest(config):
    path = ROOT / config["release_manifest"]
    write_json(path, build_manifest(config))
    return path


def validate_dist(config, require_all=False):
    failures = []
    manifest_path = ROOT / config["release_manifest"]
    if not manifest_path.exists():
        return [f"missing release manifest: {config['release_manifest']}"]
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        return [f"invalid release manifest: {exc}"]
    declared = {relative for _kind, relative in declared_artifacts(config)}
    recorded = {item.get("path") for item in manifest.get("artifacts", [])}
    if recorded != declared:
        failures.append("release manifest artifact paths do not match governor.toml")
    failures.extend(f"stale undeclared distribution: {path}" for path in stale_archives(config))
    for item in manifest.get("artifacts", []):
        path = ROOT / item.get("path", "__missing__")
        if require_all and not path.is_file():
            failures.append(f"declared release artifact missing: {item.get('path')}")
        if path.is_file() and item.get("sha256") != sha256(path):
            failures.append(f"release artifact hash mismatch: {item.get('path')}")
    return failures
