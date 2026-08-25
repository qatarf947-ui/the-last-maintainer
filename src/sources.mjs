const USER_AGENT = "the-last-maintainer/0.1";

async function getJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
  });
  if (!response.ok) {
    throw new Error(response.status + " " + response.statusText + " from " + url);
  }
  return response.json();
}

export function parseGitHubRepository(repository) {
  const raw = typeof repository === "string" ? repository : repository?.url;
  if (!raw) return null;
  const normalized = raw
    .replace(/^git\+/, "")
    .replace(/^git:\/\//, "https://")
    .replace(/^git@github\.com:/, "https://github.com/")
    .replace(/\.git(?:#.*)?$/, "")
    .replace(/#.*$/, "");
  const match = normalized.match(/github\.com\/([^/]+)\/([^/]+)/i);
  return match ? { owner: match[1], repo: match[2] } : null;
}

export async function inspectNpmPackage(candidate, now = new Date()) {
  const encoded = encodeURIComponent(candidate.name);
  const [metadata, downloads] = await Promise.all([
    getJson("https://registry.npmjs.org/" + encoded),
    getJson("https://api.npmjs.org/downloads/point/last-month/" + encoded),
  ]);

  const latestVersion = metadata["dist-tags"]?.latest;
  const latest = latestVersion ? metadata.versions?.[latestVersion] : null;
  const repo = parseGitHubRepository(latest?.repository ?? metadata.repository);
  let github = null;
  let githubError = null;

  if (repo) {
    try {
      github = await getJson("https://api.github.com/repos/" + repo.owner + "/" + repo.repo);
    } catch (error) {
      githubError = error.message;
    }
  }

  const latestPublishedAt = metadata.time?.[latestVersion] ?? metadata.time?.modified ?? null;
  const repositoryUrl = github?.html_url ?? (repo ? "https://github.com/" + repo.owner + "/" + repo.repo : null);
  const license = latest?.license ?? metadata.license ?? github?.license?.spdx_id ?? null;

  return {
    name: candidate.name,
    latestVersion,
    description: latest?.description ?? metadata.description ?? null,
    downloadsMonthly: Number(downloads.downloads ?? 0),
    latestPublishedAt,
    daysSincePublish: latestPublishedAt
      ? Math.floor((now - new Date(latestPublishedAt)) / 86_400_000)
      : null,
    deprecated: Boolean(latest?.deprecated),
    deprecationMessage: latest?.deprecated ?? null,
    license,
    licenseAllowed: !["UNLICENSED", "SEE LICENSE IN"].some((token) =>
      String(license ?? "").toUpperCase().startsWith(token),
    ),
    repositoryUrl,
    repositoryArchived: github?.archived ?? false,
    repositoryPushedAt: github?.pushed_at ?? null,
    daysSincePush: github?.pushed_at
      ? Math.floor((now - new Date(github.pushed_at)) / 86_400_000)
      : null,
    stars: github?.stargazers_count ?? null,
    forks: github?.forks_count ?? null,
    openIssues: github?.open_issues_count ?? null,
    githubError,
    replacementEase: candidate.replacementEase,
    compatibilityBurden: candidate.compatibilityBurden,
    enterpriseFit: candidate.enterpriseFit,
    analystNote: candidate.note,
    evidence: {
      registry: "https://registry.npmjs.org/" + encoded,
      downloads: "https://api.npmjs.org/downloads/point/last-month/" + encoded,
      repository: repositoryUrl,
    },
  };
}
