import type { ProviderConfig } from "./providers";

const cookieName = "governor_provider";

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(normalized);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function encryptionKey(secret: string): Promise<CryptoKey> {
  if (secret.length < 32) throw new Error("Provider vault is not configured.");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function sealProviderConfig(config: ProviderConfig, secret: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await encryptionKey(secret),
    new TextEncoder().encode(JSON.stringify(config)),
  );
  return `v1.${toBase64Url(iv)}.${toBase64Url(new Uint8Array(encrypted))}`;
}

export async function openProviderConfig(value: string, secret: string): Promise<ProviderConfig> {
  const [version, iv, data] = value.split(".");
  if (version !== "v1" || !iv || !data) throw new Error("Provider session is invalid.");
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64Url(iv) },
    await encryptionKey(secret),
    fromBase64Url(data),
  );
  return JSON.parse(new TextDecoder().decode(decrypted)) as ProviderConfig;
}

export function readProviderCookie(request: Request): string | null {
  const cookies = request.headers.get("cookie") || "";
  for (const item of cookies.split(";")) {
    const [name, ...parts] = item.trim().split("=");
    if (name === cookieName) return decodeURIComponent(parts.join("="));
  }
  return null;
}

export function providerCookie(request: Request, value: string, maxAge = 28_800): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${cookieName}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

export function clearProviderCookie(request: Request): string {
  return providerCookie(request, "", 0);
}

export async function readConfiguredProvider(request: Request, secret: string): Promise<ProviderConfig | null> {
  const cookie = readProviderCookie(request);
  if (!cookie) return null;
  return openProviderConfig(cookie, secret);
}
