import json
import sys
import time

from archive_rules import MOJIBAKE_COURSE_NAME, mojibake_paths
from generate_governance_maturity_report import render
from governance_metrics import collect_metrics
from validate_test_performance import validate_payload
from validation_result import ValidationResult, run_command


def test_validation_result_schema():
    result = ValidationResult("example", "pass", 1.25, evidence={"count": 1}).to_dict()
    assert result == {
        "validator": "example",
        "status": "pass",
        "duration_seconds": 1.25,
        "errors": [],
        "warnings": [],
        "evidence": {"count": 1},
    }


def test_run_command_records_timeout_and_terminates_child():
    result, _stdout, _stderr = run_command(
        "slow",
        [sys.executable, "-c", "import time; time.sleep(5)"],
        ".",
        {},
        0.05,
    )
    assert result.status == "timeout"
    assert "timed out" in result.errors[0]
    assert result.duration_seconds < 3


def test_test_performance_policy_pass_and_fail():
    payload = {"suite": "fast", "elapsed_seconds": 12.5, "returncode": 0, "plugin_autoload_disabled": True}
    assert validate_payload("fast", payload, 60) == []
    failures = validate_payload("fast", {**payload, "elapsed_seconds": 61}, 60)
    assert any("exceeded threshold" in failure for failure in failures)


def test_metrics_are_static_and_fast():
    started = time.monotonic()
    metrics = collect_metrics()
    assert time.monotonic() - started < 5
    assert metrics["governor_version"] == "0.7.2"


def test_maturity_report_preserves_unknown_evidence():
    report = render({"validator_statuses": {}, "validation_mode": "unknown", "validation_manifest_status": "unknown"})
    assert "# Governor Capability Maturity Report" in report
    assert "| unknown | UNKNOWN |" in report
    assert "validation manifest unavailable" in report


def test_mojibake_course_path_is_detected():
    names = [f"codex-se-governor/references/course/{MOJIBAKE_COURSE_NAME}"]
    assert mojibake_paths(names) == names
