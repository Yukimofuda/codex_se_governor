export type LocalRunnerConfig = {
  endpoint: string;
  token: string;
};

export type LocalRunnerRun = {
  id: string;
  status: "running" | "passed" | "failed" | "timed-out" | "cancelled";
  mode: "plan" | "implement";
  startedAt: string;
  endedAt?: string;
  exitCode?: number | null;
  durationSeconds?: number;
  events: Array<Record<string, unknown>>;
  output: string;
  error?: string;
};

function endpoint(config: LocalRunnerConfig, path: string) {
  const base = config.endpoint.trim().replace(/\/$/, "");
  if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(base)) throw new Error("Runner address must use localhost or 127.0.0.1.");
  if (config.token.trim().length < 16) throw new Error("Runner token must contain at least 16 characters.");
  return `${base}${path}`;
}

async function request<T>(config: LocalRunnerConfig, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(endpoint(config, path), {
    ...init,
    cache: "no-store",
    headers: { authorization: `Bearer ${config.token.trim()}`, "content-type": "application/json", ...(init?.headers || {}) },
  });
  const body = await response.json() as { ok?: boolean; error?: string } & T;
  if (!response.ok || body.ok === false) throw new Error(body.error || `Runner returned ${response.status}.`);
  return body;
}

export async function testLocalRunner(config: LocalRunnerConfig) {
  return request<{ ok: true; service: string; workspace: string; activeRuns: number }>(config, "/health");
}

export async function startLocalRunner(config: LocalRunnerConfig, input: { prompt: string; mode: "plan" | "implement"; model?: string }) {
  const body = await request<{ ok: true; run: LocalRunnerRun }>(config, "/runs", { method: "POST", body: JSON.stringify(input) });
  return body.run;
}

export async function readLocalRunnerRun(config: LocalRunnerConfig, runId: string) {
  const body = await request<{ ok: true; run: LocalRunnerRun }>(config, `/runs/${encodeURIComponent(runId)}`);
  return body.run;
}

export async function cancelLocalRunnerRun(config: LocalRunnerConfig, runId: string) {
  const body = await request<{ ok: true; run: LocalRunnerRun }>(config, `/runs/${encodeURIComponent(runId)}`, { method: "DELETE" });
  return body.run;
}
