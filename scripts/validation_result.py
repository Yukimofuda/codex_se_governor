#!/usr/bin/env python3
"""Common validation result schema, timeout execution, and manifest I/O."""

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
import json
import os
import platform
import signal
import subprocess
import sys
import time


def utc_now():
    return datetime.now(timezone.utc).isoformat()


@dataclass
class ValidationResult:
    validator: str
    status: str
    duration_seconds: float
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    evidence: dict = field(default_factory=dict)

    def to_dict(self):
        return asdict(self)


def output_lines(stdout, stderr):
    return [line.strip() for line in (stdout + "\n" + stderr).splitlines() if line.strip()]


def summarize_output(status, stdout, stderr):
    lines = output_lines(stdout, stderr)
    warnings = [line for line in lines if line.startswith("WARNING")]
    errors = []
    if status != "pass":
        errors = [line[2:] if line.startswith("- ") else line for line in lines if line.startswith(("- ", "FAIL", "ERROR"))]
        if not errors:
            errors = lines[-5:] or ["command failed without output"]
    return errors, warnings


def terminate_process_tree(process):
    if process.poll() is not None:
        return
    try:
        os.killpg(process.pid, signal.SIGTERM)
        process.wait(timeout=2)
    except (ProcessLookupError, subprocess.TimeoutExpired):
        try:
            os.killpg(process.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass


def run_command(validator, command, cwd, env, timeout_seconds):
    started = time.monotonic()
    process = subprocess.Popen(
        command,
        cwd=cwd,
        env=env,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        start_new_session=True,
    )
    timed_out = False
    try:
        stdout, stderr = process.communicate(timeout=timeout_seconds)
    except subprocess.TimeoutExpired:
        timed_out = True
        terminate_process_tree(process)
        stdout, stderr = process.communicate()
    duration = round(time.monotonic() - started, 3)
    status = "timeout" if timed_out else ("pass" if process.returncode == 0 else "fail")
    errors, warnings = summarize_output(status, stdout, stderr)
    if timed_out:
        errors.insert(0, f"command timed out after {duration}s (limit {timeout_seconds}s)")
    result = ValidationResult(
        validator=validator,
        status=status,
        duration_seconds=duration,
        errors=errors,
        warnings=warnings,
        evidence={"command": command, "returncode": process.returncode, "timeout_seconds": timeout_seconds},
    )
    return result, stdout, stderr


def new_manifest(config, mode):
    return {
        "schema_version": 1,
        "governor_version": config["version"],
        "validation_mode": mode,
        "started_at": utc_now(),
        "ended_at": None,
        "platform": platform.platform(),
        "python_version": platform.python_version(),
        "results": [],
        "failure_summary": [],
        "total_duration_seconds": 0.0,
        "release_archive_path": config["release_archive"],
        "source_archive_path": config["source_archive"],
    }


def finalize_manifest(manifest, started_monotonic):
    manifest["ended_at"] = utc_now()
    manifest["total_duration_seconds"] = round(time.monotonic() - started_monotonic, 3)
    manifest["failure_summary"] = [
        {"validator": result["validator"], "status": result["status"], "errors": result["errors"]}
        for result in manifest["results"]
        if result["status"] != "pass"
    ]
    return manifest


def write_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    temporary.replace(path)


def load_json(path, default=None):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError, UnicodeDecodeError):
        return default
