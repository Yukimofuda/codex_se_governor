export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    product: "Codex SE Governor",
    version: "0.7.2-web-mvp",
    mode: "local-first",
    execution: "disabled",
    persistence: "browser-indexeddb",
    upload: "browser-memory-only",
    checks: ["artifact-presence", "markdown-fields", "adoption-paths", "archive-hygiene", "utf8-paths"],
    unavailable: ["python-validators", "pytest", "npm-scripts", "shell", "uploaded-binaries"],
  }, { headers: { "cache-control": "public, max-age=300" } });
}
