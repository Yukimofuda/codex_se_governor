#!/usr/bin/env python3
"""Validate course provenance and optionally recheck the original PDF hash."""

from pathlib import Path
import argparse
import hashlib
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
PROVENANCE = ROOT / "docs" / "software-engineering" / "COURSE_PROVENANCE.json"
REQUIRED = {
    "original_pdf_filename",
    "original_pdf_sha256",
    "page_count",
    "conversion_method",
    "conversion_tool",
    "conversion_date",
    "generated_markdown_path",
    "generated_markdown_sha256",
    "text_comparison_method",
    "known_non_text_differences",
    "reviewer",
    "review_status",
}
HASH_BLOCK_BYTES = 1 << 20


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(HASH_BLOCK_BYTES), b""):
            digest.update(block)
    return digest.hexdigest()


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", type=Path)
    args = parser.parse_args(argv)
    failures = []
    if not PROVENANCE.exists():
        print("FAIL\n- missing docs/software-engineering/COURSE_PROVENANCE.json")
        return 1
    try:
        data = json.loads(PROVENANCE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        print(f"FAIL\n- invalid provenance JSON: {exc}")
        return 1
    failures.extend(f"course provenance missing field: {field}" for field in sorted(REQUIRED - set(data)))
    markdown = ROOT / data.get("generated_markdown_path", "__missing__")
    if not markdown.is_file():
        failures.append(f"generated Markdown missing: {data.get('generated_markdown_path')}")
    elif sha256(markdown) != data.get("generated_markdown_sha256"):
        failures.append("generated Markdown SHA-256 does not match provenance")
    if args.pdf:
        if not args.pdf.is_file():
            failures.append(f"PDF not found: {args.pdf}")
        elif sha256(args.pdf) != data.get("original_pdf_sha256"):
            failures.append("original PDF SHA-256 does not match provenance")
    if failures:
        print("FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("PASS")
    if args.pdf:
        print("- PDF equivalence evidence: original PDF hash independently rechecked")
    else:
        print("- PDF equivalence evidence: attested; original PDF was not supplied for independent recheck")
    return 0


if __name__ == "__main__":
    sys.exit(main())
