export type GithubRepository = {
  owner: string;
  repo: string;
};

export type GithubTreeResult = GithubRepository & {
  branch: string;
  sha: string;
  paths: string[];
  truncated: boolean;
};

export function parseGithubRepoUrl(value: string): GithubRepository | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com") return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/i, "");
    if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) return null;
    return { owner, repo };
  } catch {
    return null;
  }
}

export async function fetchPublicGithubTree(value: string, signal?: AbortSignal): Promise<GithubTreeResult> {
  const repository = parseGithubRepoUrl(value);
  if (!repository) throw new Error("Enter a valid public GitHub repository URL.");
  const repoResponse = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.repo)}`,
    { headers: { accept: "application/vnd.github+json" }, signal },
  );
  if (!repoResponse.ok) throw new Error(`GitHub repository lookup returned ${repoResponse.status}.`);
  const metadata = await repoResponse.json() as { default_branch?: string };
  const branch = metadata.default_branch || "main";
  const treeResponse = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    { headers: { accept: "application/vnd.github+json" }, signal },
  );
  if (!treeResponse.ok) throw new Error(`GitHub tree lookup returned ${treeResponse.status}.`);
  const tree = await treeResponse.json() as {
    sha?: string;
    truncated?: boolean;
    tree?: Array<{ path?: string; type?: string }>;
  };
  return {
    ...repository,
    branch,
    sha: tree.sha || "unknown",
    paths: (tree.tree || [])
      .filter((entry) => entry.type === "blob" && typeof entry.path === "string")
      .map((entry) => entry.path as string),
    truncated: Boolean(tree.truncated),
  };
}
