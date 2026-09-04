export function providerVaultSecret(): string {
  // With nodejs_compat, Cloudflare Worker text bindings are exposed through process.env.
  const vaultKey = typeof process !== "undefined" ? process.env.PROVIDER_VAULT_SECRET || "" : "";
  if (vaultKey.length < 32) throw new Error("Provider vault is not configured.");
  return vaultKey;
}
