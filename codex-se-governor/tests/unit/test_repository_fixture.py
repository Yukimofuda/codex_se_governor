from tests.helpers import copy_full_repo


def test_full_repo_fixture_excludes_generated_web_trees(tmp_path):
    source_root = tmp_path / "source"
    web_root = source_root / "web"
    generated = ("node_modules", ".vinext", ".wrangler", ".qa")
    (web_root / "package.json").parent.mkdir(parents=True)
    (web_root / "package.json").write_text("{}", encoding="utf-8")
    for name in generated:
        marker = web_root / name / "fixture-marker.txt"
        marker.parent.mkdir(parents=True)
        marker.write_text("generated", encoding="utf-8")

    repo = copy_full_repo(tmp_path, source_root)

    for name in generated:
        assert not (repo / "web" / name).exists()
    assert (repo / "web" / "package.json").is_file()
