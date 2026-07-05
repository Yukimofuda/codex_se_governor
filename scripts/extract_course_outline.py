#!/usr/bin/env python3
"""Extract numbered course sections from the course reference markdown."""

from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT / "references" / "course" / "软件工程全整理.md"
SECTION_RE = re.compile(r"^\s*(?P<section>(?:[1-9]|1[0-7])(?:\.\d+){0,2})\s+(?P<title>[^.\n\f][^\n\f]*?)\s*$")
DOT_LEADER_RE = re.compile(r"\s+\.{2,}\s+\d+\s*$")
TRAILING_PAGE_RE = re.compile(r"\s+\d{1,4}$")
PAGE_ONLY_RE = re.compile(r"^\d+$")


def normalize_title(title):
    title = DOT_LEADER_RE.sub("", title).strip()
    title = TRAILING_PAGE_RE.sub("", title).strip()
    title = re.sub(r"\s+", " ", title)
    return title


def extract():
    if not COURSE.exists():
        raise FileNotFoundError(COURSE)
    sections = {}
    for line in COURSE.read_text(encoding="utf-8", errors="ignore").splitlines():
        if PAGE_ONLY_RE.match(line.strip()):
            continue
        match = SECTION_RE.match(line)
        if not match:
            continue
        section = match.group("section")
        title = normalize_title(match.group("title"))
        if not title or title.startswith("EBU6304") or title == "Software Engineering":
            continue
        current = sections.get(section)
        if current is None or ("." in current["title"] and "." not in title):
            sections[section] = {
                "section": section,
                "title": title,
                "chapter": section.split(".")[0],
                "source": "references/course/软件工程全整理.md",
            }
    def key(item):
        return [int(part) for part in item["section"].split(".")]
    return sorted(sections.values(), key=key)


def main():
    try:
        print(json.dumps(extract(), ensure_ascii=False, indent=2))
    except FileNotFoundError as exc:
        print(f"FAIL missing course source: {exc}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
