import { spawn } from "node:child_process";
import { timingSafeEqual, randomUUID } from "node:crypto";
import { stat } from "node:fs/promises";
import http from "node:http";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_PORT = 4777;
const MAX_PROMPT_BYTES = 64 * 1024;
const MAX_OUTPUT_BYTES = 2 * 1024 * 1024;
const MAX_RUNS = 20;

export function parseRunnerArgs(argv) {
  const result = { port: DEFAULT_PORT, origins: ["https://codex-se-governor-app.yukikana0108.chatgpt.site", "http://localhost:3000", "http://localhost:5173"], timeoutSeconds: 900 };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (["--workspace", "--token", "--port", "--origin", "--timeout"].includes(flag) && !value) throw new Error(`${flag} requires a value.`);
    if (flag === "--workspace") { result.workspace = resolve(value); index += 1; }
    else if (flag === "--token") { result.token = value; index += 1; }
    else if (flag === "--port") { result.port = Number(value); index += 1; }
    else if (flag === "--origin") { result.origins = value.split(",").map((item) => item.trim().replace(/\/$/, "")).filter(Boolean); index += 1; }
    else if (flag === "--timeout") { result.timeoutSeconds = Number(value); index += 1; }
    else if (flag === "--help" || flag === "-h") result.help = true;
    else throw new Error(`Unknown option: ${flag}`);
  }
  if (!result.help) {
    if (!result.workspace) throw new Error("--workspace is required.");
    if (!result.token || result.token.length < 16) throw new Error("--token must contain at least 16 characters.");
    if (!Number.isInteger(result.port) || result.port < 1024 || result.port > 65535) throw new Error("--port must be between 1024 and 65535.");
    if (!Number.isFinite(result.timeoutSeconds) || result.timeoutSeconds < 30 || result.timeoutSeconds > 1800) throw new Error("--timeout must be between 30 and 1800 seconds.");
  }
  return result;
}

export function buildCodexArgs({ mode = "plan", model } = {}) {
  const sandbox = mode === "implement" ? "workspace-write" : "read-only";
  const args = ["exec", "--json", "--ephemeral", "--color", "never", "--sandbox", sandbox, "-c", 'approval_policy="never"'];
  if (model) args.push("--model", String(model).slice(0, 120));
  args.push("-");
  return args;
}

export function safeEqual(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length === b.length && timingSafeEqual(a, b);
}

export function corsHeaders(origin, allowedOrigins) {
  const normalized = String(origin || "").replace(/\/$/, "");
  if (!allowedOrigins.includes(normalized)) return null;
  return {
    "access-control-allow-origin": normalized,
    "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
    "access-control-allow-headers": "authorization,content-type",
    "access-control-allow-private-network": "true",
    "access-control-max-age": "600",
    vary: "Origin",
  };
}

function json(response, status, body, extraHeaders = {}) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extraHeaders });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_PROMPT_BYTES + 16 * 1024) throw new Error("Request is too large.");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function publicRun(run) {
  return {
    id: run.id,
    status: run.status,
    mode: run.mode,
    startedAt: run.startedAt,
    endedAt: run.endedAt,
    exitCode: run.exitCode,
    durationSeconds: run.endedAt ? Math.max(0, (Date.parse(run.endedAt) - Date.parse(run.startedAt)) / 1000) : undefined,
    events: run.events,
    output: run.output,
    error: run.error,
  };
}

export async function createRunnerServer(config) {
  const workspaceStats = await stat(config.workspace);
  if (!workspaceStats.isDirectory()) throw new Error("Configured workspace is not a directory.");
  const runs = new Map();

  const server = http.createServer(async (request, response) => {
    const originHeaders = corsHeaders(request.headers.origin, config.origins);
    if (!originHeaders) return json(response, 403, { ok: false, error: "Origin is not allowed." });
    if (request.method === "OPTIONS") return json(response, 204, {}, originHeaders);
    const bearer = String(request.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!safeEqual(bearer, config.token)) return json(response, 401, { ok: false, error: "Runner token is invalid." }, originHeaders);

    const url = new URL(request.url || "/", `http://127.0.0.1:${config.port}`);
    if (request.method === "GET" && url.pathname === "/health") {
      return json(response, 200, { ok: true, service: "codex-se-governor-runner", workspace: config.workspace.split(/[\\/]/).filter(Boolean).at(-1), activeRuns: [...runs.values()].filter((item) => item.status === "running").length }, originHeaders);
    }
    if (request.method === "POST" && url.pathname === "/runs") {
      try {
        if ([...runs.values()].some((item) => item.status === "running")) return json(response, 409, { ok: false, error: "A Codex run is already active." }, originHeaders);
        const body = await readJson(request);
        const prompt = String(body.prompt || "").trim();
        const mode = body.mode === "implement" ? "implement" : "plan";
        if (!prompt) throw new Error("Prompt is required.");
        if (Buffer.byteLength(prompt, "utf8") > MAX_PROMPT_BYTES) throw new Error("Prompt exceeds 64 KiB.");
        const id = randomUUID();
        const run = { id, mode, status: "running", startedAt: new Date().toISOString(), events: [], output: "", error: "" };
        runs.set(id, run);
        while (runs.size > MAX_RUNS) runs.delete(runs.keys().next().value);
        const child = spawn("codex", buildCodexArgs({ mode, model: body.model }), {
          cwd: config.workspace,
          env: { ...process.env, NO_COLOR: "1", PYTHONDONTWRITEBYTECODE: "1" },
          shell: false,
          stdio: ["pipe", "pipe", "pipe"],
        });
        run.child = child;
        const timer = setTimeout(() => {
          run.error = `Run exceeded ${config.timeoutSeconds} seconds.`;
          run.status = "timed-out";
          child.kill("SIGTERM");
          setTimeout(() => child.kill("SIGKILL"), 1500).unref();
        }, config.timeoutSeconds * 1000);
        const append = (channel, value) => {
          const text = String(value);
          if (Buffer.byteLength(run.output, "utf8") < MAX_OUTPUT_BYTES) run.output = `${run.output}${channel === "stderr" ? "[stderr] " : ""}${text}`.slice(-MAX_OUTPUT_BYTES);
          for (const line of text.split(/\r?\n/).filter(Boolean)) {
            let event = { type: channel, message: line.slice(0, 4000) };
            try { event = { type: channel, ...JSON.parse(line) }; } catch { /* Keep plain output. */ }
            run.events.push(event);
            if (run.events.length > 500) run.events.shift();
          }
        };
        child.stdout.on("data", (chunk) => append("stdout", chunk));
        child.stderr.on("data", (chunk) => append("stderr", chunk));
        child.on("error", (error) => { run.error = error.message; run.status = "failed"; run.endedAt = new Date().toISOString(); clearTimeout(timer); });
        child.on("close", (code, signal) => {
          clearTimeout(timer);
          run.exitCode = code;
          run.signal = signal;
          run.endedAt = new Date().toISOString();
          if (run.status === "running") run.status = code === 0 ? "passed" : "failed";
          delete run.child;
        });
        child.stdin.end(`${prompt}\n`);
        return json(response, 202, { ok: true, run: publicRun(run) }, originHeaders);
      } catch (error) {
        return json(response, 400, { ok: false, error: error instanceof Error ? error.message : "Could not start run." }, originHeaders);
      }
    }
    const match = url.pathname.match(/^\/runs\/([0-9a-f-]+)$/i);
    if (match && request.method === "GET") {
      const run = runs.get(match[1]);
      return run ? json(response, 200, { ok: true, run: publicRun(run) }, originHeaders) : json(response, 404, { ok: false, error: "Run was not found." }, originHeaders);
    }
    if (match && request.method === "DELETE") {
      const run = runs.get(match[1]);
      if (!run) return json(response, 404, { ok: false, error: "Run was not found." }, originHeaders);
      if (run.child) run.child.kill("SIGTERM");
      run.status = "cancelled";
      run.endedAt = new Date().toISOString();
      return json(response, 200, { ok: true, run: publicRun(run) }, originHeaders);
    }
    return json(response, 404, { ok: false, error: "Route was not found." }, originHeaders);
  });
  return server;
}

function usage() {
  return `Codex SE Governor local runner\n\nUsage:\n  node local-runner/server.mjs --workspace /path/to/repo --token <random-token> [--origin https://site] [--port 4777]\n\nThe runner listens on 127.0.0.1 and never sends the workspace path to the web app.`;
}

async function main() {
  try {
    const config = parseRunnerArgs(process.argv.slice(2));
    if (config.help) { process.stdout.write(`${usage()}\n`); return; }
    const server = await createRunnerServer(config);
    server.listen(config.port, "127.0.0.1", () => {
      process.stdout.write(`Codex SE Governor runner listening at http://127.0.0.1:${config.port}\nWorkspace: ${config.workspace}\nAllowed origins: ${config.origins.join(", ")}\n`);
    });
  } catch (error) {
    process.stderr.write(`FAIL: ${error instanceof Error ? error.message : error}\n\n${usage()}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) await main();
