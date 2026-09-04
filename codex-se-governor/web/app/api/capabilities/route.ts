export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    product: "Codex SE Governor",
    version: "webui-3.0",
    mode: "governance-workspace",
    execution: "external-evidence-import-and-loopback-codex-runner",
    localRunner: {
      transport: "loopback-only",
      authentication: "in-memory-bearer-token",
      analysisSandbox: "read-only",
      implementationSandbox: "workspace-write",
    },
    persistence: "browser-indexeddb",
    upload: "browser-memory-only",
    checks: ["validation-manifest", "adoption-paths", "archive-hygiene", "utf8-paths", "public-github-tree"],
    ai: "server-side-provider-session",
    secretStorage: "encrypted-httponly-session",
    unavailable: ["accounts", "cloud-sync", "private-github", "server-side-repository-execution", "uploaded-binaries"],
  }, { headers: { "cache-control": "public, max-age=300" } });
}
