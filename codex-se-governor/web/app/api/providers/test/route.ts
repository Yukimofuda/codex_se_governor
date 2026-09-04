import { providerCookie, readConfiguredProvider, sealProviderConfig } from "../../../server/provider-vault";
import { providerMetadata, redactProviderError, validateCredentials } from "../../../server/providers";
import { providerVaultSecret } from "../../../server/runtime-env";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const vaultKey = providerVaultSecret();
    const config = await readConfiguredProvider(request, vaultKey);
    if (!config) return Response.json({ ok: false, error: "Configure a provider before testing it." }, { status: 409 });
    const result = await validateCredentials(config);
    const tested = { ...config, lastTestedAt: new Date().toISOString() };
    const sealed = await sealProviderConfig(tested, vaultKey);
    return Response.json({ ok: true, provider: providerMetadata(tested, "connected"), models: result.models }, {
      headers: { "cache-control": "no-store", "set-cookie": providerCookie(request, sealed) },
    });
  } catch (error) {
    return Response.json({ ok: false, error: redactProviderError(error) }, { status: 400, headers: { "cache-control": "no-store" } });
  }
}
