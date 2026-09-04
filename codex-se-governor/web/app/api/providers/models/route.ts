import { readConfiguredProvider } from "../../../server/provider-vault";
import { redactProviderError, validateCredentials } from "../../../server/providers";
import { providerVaultSecret } from "../../../server/runtime-env";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const config = await readConfiguredProvider(request, providerVaultSecret());
    if (!config) return Response.json({ ok: false, error: "AI provider is not configured." }, { status: 409 });
    const result = await validateCredentials(config);
    return Response.json({ ok: true, models: result.models }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return Response.json({ ok: false, error: redactProviderError(error) }, { status: 400, headers: { "cache-control": "no-store" } });
  }
}
