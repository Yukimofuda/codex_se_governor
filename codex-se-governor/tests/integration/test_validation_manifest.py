import copy
import json
import sys

from governor_config import load_config
from run_full_validation import execute_specs


def run_custom(tmp_path, command, timeout=2):
    config = copy.deepcopy(load_config())
    config["validation"]["fast_timeout_seconds"] = timeout
    config["validation"]["validator_timeout_seconds"] = timeout
    manifest = tmp_path / "validation-results.json"
    code = execute_specs([("custom", command)], "fast", config, manifest, env={})
    return code, json.loads(manifest.read_text(encoding="utf-8"))


def test_validation_manifest_is_written_on_pass(tmp_path):
    code, manifest = run_custom(tmp_path, [sys.executable, "-c", "print('PASS')"])
    assert code == 0
    assert manifest["results"][0]["status"] == "pass"
    assert manifest["ended_at"]


def test_validation_manifest_is_written_on_failure(tmp_path):
    code, manifest = run_custom(tmp_path, [sys.executable, "-c", "print('FAIL'); raise SystemExit(3)"])
    assert code == 1
    assert manifest["results"][0]["status"] == "fail"
    assert manifest["failure_summary"]


def test_validation_manifest_records_timeout(tmp_path):
    code, manifest = run_custom(tmp_path, [sys.executable, "-c", "import time; time.sleep(5)"], timeout=0.05)
    assert code == 124
    assert manifest["results"][0]["status"] == "timeout"
    assert "timed out" in manifest["results"][0]["errors"][0]
