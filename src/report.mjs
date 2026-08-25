import { digest } from "./scoring.mjs";

function number(value) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function escapeCell(value) {
  return String(value ?? "—").replaceAll("|", "\\|").replaceAll("\n", " ");
}

export function buildSnapshot(results, generatedAt = new Date().toISOString()) {
  const ranked = [...results].sort((a, b) => b.assessment.score - a.assessment.score);
  const body = {
    schema: "last-maintainer/extinction-index@1",
    generatedAt,
    policy: {
      minimumMonthlyDownloads: 100_000,
      investigateScore: 60,
      adoptScore: 75,
    },
    candidates: ranked,
  };
  return { ...body, sha256: digest(body) };
}

export function verifySnapshot(snapshot) {
  const { sha256, ...body } = snapshot;
  const calculated = digest(body);
  return { valid: sha256 === calculated, expected: sha256, calculated };
}

export function renderMarkdown(snapshot) {
  const rows = snapshot.candidates
    .map(({ facts, assessment }) =>
      [
        "|",
        escapeCell(facts.name),
        "|",
        assessment.score.toFixed(1),
        "|",
        assessment.decision,
        "|",
        number(facts.downloadsMonthly),
        "|",
        facts.daysSincePublish ?? "—",
        "|",
        facts.repositoryArchived ? "yes" : "no",
        "|",
        facts.deprecated ? "yes" : "no",
        "|",
      ].join(" "),
    )
    .join("\n");

  const leader = snapshot.candidates[0];
  const investigations = snapshot.candidates.filter((item) =>
    ["ADOPT", "INVESTIGATE"].includes(item.assessment.decision),
  );

  const machineDecision = leader
    ? "The highest-ranked package is **" +
      leader.facts.name +
      "** at **" +
      leader.assessment.score.toFixed(1) +
      "**. Its current disposition is **" +
      leader.assessment.decision +
      "**."
    : "No candidates were scored.";

  const nextGate = investigations.length
    ? "The next gate is migration-cost validation for: " +
      investigations.map((item) => "**" + item.facts.name + "**").join(", ") +
      ". Adoption is forbidden until at least one real organization demonstrates costly dependency on the package."
    : "No package passed the investigation gate. The candidate set must expand before any code is adopted.";

  const evidence = snapshot.candidates
    .map(({ facts }) => {
      if (facts.error) return "- **" + facts.name + ":** scan failed: " + facts.error;
      const links = [
        "[npm metadata](" + facts.evidence.registry + ")",
        "[download evidence](" + facts.evidence.downloads + ")",
      ];
      if (facts.evidence.repository) links.push("[source repository](" + facts.evidence.repository + ")");
      return "- **" + facts.name + ":** " + links.join(", ") + ". " + facts.analystNote;
    })
    .join("\n");

  const tick = String.fromCharCode(96);
  return [
    "# The Last Maintainer — Extinction Index",
    "",
    "Generated: " + snapshot.generatedAt,
    "",
    "Evidence digest: " + tick + snapshot.sha256 + tick,
    "",
    "| Package | Score | Decision | Monthly downloads | Days since release | Archived | Deprecated |",
    "|---|---:|---|---:|---:|---|---|",
    rows,
    "",
    "## Machine decision",
    "",
    machineDecision,
    "",
    nextGate,
    "",
    "## What the score means",
    "",
    "The score combines live package demand, evidence of abandonment, difficulty of replacement, compatibility burden, and enterprise relevance. It ranks where continuity may be economically valuable; it is not a security rating and it does not declare ownership of upstream projects.",
    "",
    "## Evidence",
    "",
    evidence,
    "",
  ].join("\n");
}
