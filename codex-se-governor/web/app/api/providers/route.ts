import { clearProviderCookie, providerCookie, readConfiguredProvider, sealProviderConfig } from "../../server/provider-vault";
import { normalizeProviderInput, providerCatalog, providerMetadata, redactProviderError } from "../../server/providers";
import { providerVaultSecret } from "../../server/runtime-env";

export const dynamic = "force-dynamic";

function unavailable(error: unknown, status = 400) {
  return Response.json({ ok: false, error: redactProviderError(error) }, { status, headers: { "cache-control": "no-store" } });
}

export async function GET(request: Request) {
  try {
    const config = await readConfiguredProvider(request, providerVaultSecret());
    return Response.json({
      ok: true,
      vaultAvailable: true,
      configured: Boolean(config),
      provider: config ? providerMetadata(config, config.lastTestedAt ? "connected" : "configured") : null,
      catalog: providerCatalog,
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (String(error).includes("Provider vault is not configured")) {
      return Response.json({
        ok: true,
        vaultAvailable: false,
        configured: false,
        provider: null,
        catalog: providerCatalog,
      }, { headers: { "cache-control": "no-store" } });
    }
    return unavailable(error, 503);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const config = normalizeProviderInput(body);
    const sealed = await sealProviderConfig(config, providerVaultSecret());
    return Response.json({ ok: true, provider: providerMetadata(config) }, {
      headers: { "cache-control": "no-store", "set-cookie": providerCookie(request, sealed) },
    });
  } catch (error) {
    return unavailable(error, String(error).includes("not configured") ? 503 : 400);
  }
}

export async function DELETE(request: Request) {
  return Response.json({ ok: true }, {
    headers: { "cache-control": "no-store", "set-cookie": clearProviderCookie(request) },
  });
}
