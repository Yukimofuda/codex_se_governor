const encoder = new TextEncoder();

function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function sha256(value) {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  return toHex(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)));
}

export async function buildReleaseManifest(files) {
  const entries = await Promise.all(
    Object.entries(files)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(async ([path, content]) => ({
        path,
        bytes: encoder.encode(content).length,
        sha256: await sha256(content),
      })),
  );
  return {
    schema: 2,
    evidence: "browser-generated",
    utf8Paths: true,
    files: entries,
  };
}

export function metricsToCsv(metrics) {
  const rows = [["Metric", "Value"]];
  for (const [key, value] of Object.entries(metrics)) {
    rows.push([key, Array.isArray(value) ? value.join("; ") : String(value)]);
  }
  return rows
    .map((row) => row.map((value) => `"${value.replaceAll("\"", "\"\"")}"`).join(","))
    .join("\n");
}

export function containsPrivateMaterial(files) {
  const findings = [];
  for (const [path, content] of Object.entries(files)) {
    if (/(^|\/)(__MACOSX|node_modules|\.pytest_cache|__pycache__)(\/|$)|\.DS_Store$|\.pyc$/i.test(path)) {
      findings.push(`${path}: generated artifact`);
    }
    if (/\/Users\/[^/\s]+|\/home\/[^/\s]+/i.test(content)) {
      findings.push(`${path}: local absolute path`);
    }
    if (/(api[_-]?key|authorization\s*:\s*bearer|secret)\s*[:=]\s*[^\s<{\[]+/i.test(content)) {
      findings.push(`${path}: possible credential`);
    }
  }
  return findings;
}
