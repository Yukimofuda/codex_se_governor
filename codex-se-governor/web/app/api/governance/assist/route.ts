import { readConfiguredProvider } from "../../../server/provider-vault";
import { generateWithProvider, redactProviderError } from "../../../server/providers";
import { providerVaultSecret } from "../../../server/runtime-env";

export const dynamic = "force-dynamic";

const systemPrompt = `You assist with software engineering requirements. Return concise JSON only. Do not invent validated facts, test results, repository state, security approval, or release readiness. Mark assumptions explicitly. Preserve requirement IDs supplied by the user.`;

export async function POST(request: Request) {
  try {
    const config = await readConfiguredProvider(request, providerVaultSecret());
    if (!config) return Response.json({ ok: false, error: "Configure an AI provider before using assisted structuring." }, { status: 409 });
    const body = await request.json() as { operation?: string; input?: unknown };
    if (body.operation !== "structure-requirement") {
      return Response.json({ ok: false, error: "Unsupported assistance operation." }, { status: 400 });
    }
    const prompt = `Structure this requirement into JSON with keys: title, goal, userProblem, stakeholders, userStory, functional, constraints, acceptanceCriteria, security, performance, outOfScope, assumptions, conflicts, additionalContext. userStory must contain role, goal, benefit. Arrays must contain concise, observable statements. acceptanceCriteria must cover normal, boundary, failure, security, and regression outcomes when relevant. Do not invent test results, repository facts, numeric performance targets, approvals, or release status. Input:\n${JSON.stringify(body.input).slice(0, 18000)}`;
    const text = await generateWithProvider(config, systemPrompt, prompt);
    const clean = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const result = JSON.parse(clean) as Record<string, unknown>;
    return Response.json({ ok: true, result }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return Response.json({ ok: false, error: redactProviderError(error) }, { status: 400, headers: { "cache-control": "no-store" } });
  }
}
