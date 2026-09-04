export type ProviderId = "openai" | "anthropic" | "gemini" | "openrouter" | "custom";

export type ProviderConfig = {
  provider: ProviderId;
  apiKey: string;
  baseUrl?: string;
  model: string;
  organization?: string;
  project?: string;
  timeoutSeconds: number;
  maxRetries: number;
  savedAt: string;
  lastTestedAt?: string;
};

export type ProviderMetadata = Omit<ProviderConfig, "apiKey"> & {
  maskedKey: string;
  status: "configured" | "not-configured" | "invalid" | "connected";
};

const providerDefaults: Record<ProviderId, { baseUrl: string; model: string }> = {
  openai: { baseUrl: "https://api.openai.com/v1", model: "gpt-5" },
  anthropic: { baseUrl: "https://api.anthropic.com/v1", model: "claude-sonnet-4-5" },
  gemini: { baseUrl: "https://generativelanguage.googleapis.com/v1beta", model: "gemini-2.5-flash" },
  openrouter: { baseUrl: "https://openrouter.ai/api/v1", model: "openai/gpt-5" },
  custom: { baseUrl: "", model: "" },
};

const privateIpv4 = /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;

export function normalizeProviderInput(input: Partial<ProviderConfig>): ProviderConfig {
  const provider = input.provider;
  if (!provider || !Object.hasOwn(providerDefaults, provider)) throw new Error("Choose a supported AI provider.");
  const defaults = providerDefaults[provider];
  const apiKey = String(input.apiKey || "").trim();
  const model = String(input.model || defaults.model).trim();
  const baseUrl = String(input.baseUrl || defaults.baseUrl).trim().replace(/\/+$/, "");
  const requestedTimeout = Number(input.timeoutSeconds);
  const requestedRetries = Number(input.maxRetries);
  const timeoutSeconds = Math.max(5, Math.min(120, Number.isFinite(requestedTimeout) ? requestedTimeout : 30));
  const maxRetries = Math.max(0, Math.min(3, Number.isFinite(requestedRetries) ? requestedRetries : 1));
  if (apiKey.length < 8) throw new Error("API key is missing or too short.");
  if (!model) throw new Error("Model is required.");
  if (!baseUrl) throw new Error("Base URL is required.");
  assertSafeProviderUrl(baseUrl, provider === "custom");
  return {
    provider,
    apiKey,
    model,
    baseUrl,
    organization: String(input.organization || "").trim() || undefined,
    project: String(input.project || "").trim() || undefined,
    timeoutSeconds,
    maxRetries,
    savedAt: input.savedAt || new Date().toISOString(),
    lastTestedAt: input.lastTestedAt,
  };
}

export function assertSafeProviderUrl(value: string, allowCustom = true): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Base URL is not a valid URL.");
  }
  if (url.protocol !== "https:") throw new Error("Base URL must use HTTPS.");
  if (url.username || url.password) throw new Error("Base URL must not contain credentials.");
  if (url.port && url.port !== "443") throw new Error("Custom provider URL must use the standard HTTPS port.");
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host === "::1" || privateIpv4.test(host)) {
    throw new Error("Private or local provider addresses are not allowed.");
  }
  if (!allowCustom && !Object.values(providerDefaults).some((item) => item.baseUrl && new URL(item.baseUrl).hostname === url.hostname)) {
    throw new Error("Provider URL does not match the selected provider.");
  }
  return url;
}

export function maskApiKey(value: string): string {
  const tail = value.slice(-4);
  return `${value.slice(0, Math.min(3, Math.max(0, value.length - 4)))}${"•".repeat(8)}${tail}`;
}

export function providerMetadata(config: ProviderConfig, status: ProviderMetadata["status"] = "configured"): ProviderMetadata {
  const { apiKey, ...rest } = config;
  return { ...rest, maskedKey: maskApiKey(apiKey), status };
}

export function redactProviderError(value: unknown): string {
  const text = value instanceof Error ? value.message : String(value || "Provider request failed.");
  return text
    .replace(/\b(sk-|key-|AIza)[A-Za-z0-9._-]{6,}\b/g, "[REDACTED]")
    .replace(/(authorization|x-api-key)\s*[:=]\s*[^\s,;]+/gi, "$1: [REDACTED]")
    .slice(0, 280);
}

function headers(config: ProviderConfig): Record<string, string> {
  const result: Record<string, string> = { "content-type": "application/json" };
  if (config.provider === "anthropic") {
    result["x-api-key"] = config.apiKey;
    result["anthropic-version"] = "2023-06-01";
  } else if (config.provider !== "gemini") {
    result.authorization = `Bearer ${config.apiKey}`;
    if (config.organization) result["OpenAI-Organization"] = config.organization;
    if (config.project) result["OpenAI-Project"] = config.project;
  }
  return result;
}

function endpoint(config: ProviderConfig, operation: "models" | "generate"): string {
  const base = config.baseUrl || providerDefaults[config.provider].baseUrl;
  if (config.provider === "anthropic") return `${base}/messages`;
  if (config.provider === "gemini") {
    if (operation === "models") return `${base}/models?key=${encodeURIComponent(config.apiKey)}`;
    return `${base}/models/${encodeURIComponent(config.model)}:generateContent?key=${encodeURIComponent(config.apiKey)}`;
  }
  if (config.provider === "openai") return operation === "models" ? `${base}/models` : `${base}/responses`;
  return operation === "models" ? `${base}/models` : `${base}/chat/completions`;
}

async function providerFetch(config: ProviderConfig, url: string, init?: RequestInit): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= config.maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutSeconds * 1000);
    try {
      const response = await fetch(url, { ...init, headers: { ...headers(config), ...(init?.headers || {}) }, signal: controller.signal, redirect: "error" });
      if (attempt >= config.maxRetries || ![408, 429].includes(response.status) && response.status < 500) return response;
      lastError = new Error(`Provider connection returned ${response.status}.`);
    } catch (error) {
      lastError = error;
      if (attempt >= config.maxRetries) throw error;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Provider request failed.");
}

export async function validateCredentials(config: ProviderConfig): Promise<{ ok: true; models: string[] }> {
  const response = await providerFetch(config, endpoint(config, "models"), { method: "GET" });
  if (!response.ok) throw new Error(`Provider connection returned ${response.status}.`);
  const data = await response.json() as { data?: Array<{ id?: string }>; models?: Array<{ name?: string }> };
  const models = config.provider === "gemini"
    ? (data.models || []).map((item) => (item.name || "").replace(/^models\//, "")).filter(Boolean)
    : (data.data || []).map((item) => item.id || "").filter(Boolean);
  return { ok: true, models: models.slice(0, 100) };
}

export async function generateWithProvider(config: ProviderConfig, system: string, prompt: string): Promise<string> {
  const cleanSystem = system.slice(0, 8000);
  const cleanPrompt = prompt.slice(0, 20000);
  let body: unknown;
  if (config.provider === "anthropic") {
    body = { model: config.model, max_tokens: 2400, system: cleanSystem, messages: [{ role: "user", content: cleanPrompt }] };
  } else if (config.provider === "gemini") {
    body = { systemInstruction: { parts: [{ text: cleanSystem }] }, contents: [{ role: "user", parts: [{ text: cleanPrompt }] }], generationConfig: { temperature: 0.1 } };
  } else if (config.provider === "openai") {
    body = { model: config.model, store: false, input: [{ role: "system", content: cleanSystem }, { role: "user", content: cleanPrompt }] };
  } else {
    body = { model: config.model, temperature: 0.1, messages: [{ role: "system", content: cleanSystem }, { role: "user", content: cleanPrompt }] };
  }
  const response = await providerFetch(config, endpoint(config, "generate"), { method: "POST", body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`Provider generation returned ${response.status}.`);
  const data = await response.json() as {
    content?: Array<{ text?: string }>;
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    choices?: Array<{ message?: { content?: string } }>;
    output_text?: string;
    output?: Array<{ content?: Array<{ text?: string }> }>;
  };
  const text = config.provider === "anthropic"
    ? data.content?.map((item) => item.text || "").join("\n")
    : config.provider === "gemini"
      ? data.candidates?.[0]?.content?.parts?.map((item) => item.text || "").join("\n")
      : config.provider === "openai"
        ? data.output_text || data.output?.flatMap((item) => item.content || []).map((item) => item.text || "").join("\n")
        : data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Provider returned no usable text.");
  return text;
}

export const providerCatalog = Object.entries(providerDefaults).map(([id, value]) => ({ id: id as ProviderId, ...value }));
