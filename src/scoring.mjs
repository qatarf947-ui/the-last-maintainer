import { createHash } from "node:crypto";

export function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function daysBetween(older, newer = new Date()) {
  if (!older) return null;
  const start = new Date(older);
  const end = new Date(newer);
  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) return null;
  return Math.max(0, Math.floor((end - start) / 86_400_000));
}

export function demandScore(downloadsMonthly = 0) {
  if (downloadsMonthly <= 0) return 0;
  // 100k monthly is the floor; 100m monthly saturates the signal.
  return clamp(((Math.log10(downloadsMonthly) - 5) / 3) * 100);
}

export function dormancyScore(daysSincePublish, daysSincePush) {
  const observed = [daysSincePublish, daysSincePush].filter(Number.isFinite);
  if (!observed.length) return 0;
  const days = Math.min(...observed);
  // Active within 180 days is healthy; four quiet years saturates dormancy.
  return clamp(((days - 180) / (1460 - 180)) * 100);
}

export function abandonmentScore({ deprecated, repositoryArchived, daysSincePublish, daysSincePush }) {
  const explicit = Math.max(deprecated ? 88 : 0, repositoryArchived ? 100 : 0);
  const silent = dormancyScore(daysSincePublish, daysSincePush);
  return clamp(Math.max(explicit, silent));
}

export function scoreCandidate(facts) {
  const demand = demandScore(facts.downloadsMonthly);
  const abandonment = abandonmentScore(facts);
  const replacementResistance = 100 - clamp(facts.replacementEase ?? 50);
  const compatibilityBurden = clamp(facts.compatibilityBurden ?? 50);
  const enterpriseFit = clamp(facts.enterpriseFit ?? 50);
  const licenseAllowed = facts.licenseAllowed !== false;

  const score = clamp(
    demand * 0.27 +
      abandonment * 0.27 +
      replacementResistance * 0.18 +
      compatibilityBurden * 0.13 +
      enterpriseFit * 0.15,
  );

  const hardReject = !licenseAllowed || facts.downloadsMonthly < 100_000;
  let decision = "WATCH";
  if (hardReject) decision = "REJECT";
  else if (score >= 75) decision = "ADOPT";
  else if (score >= 60) decision = "INVESTIGATE";

  const completeness = [
    facts.downloadsMonthly,
    facts.latestPublishedAt,
    facts.repositoryUrl,
    facts.repositoryPushedAt,
    facts.license,
  ].filter(Boolean).length;

  return {
    score: Number(score.toFixed(1)),
    decision,
    confidence: Number((completeness / 5).toFixed(2)),
    signals: {
      demand: Number(demand.toFixed(1)),
      abandonment: Number(abandonment.toFixed(1)),
      replacementResistance,
      compatibilityBurden,
      enterpriseFit,
    },
  };
}

export function canonicalJson(value) {
  if (Array.isArray(value)) return "[" + value.map(canonicalJson).join(",") + "]";
  if (value && typeof value === "object") {
    return (
      "{" +
      Object.keys(value)
        .sort()
        .map((key) => JSON.stringify(key) + ":" + canonicalJson(value[key]))
        .join(",") +
      "}"
    );
  }
  return JSON.stringify(value);
}

export function digest(value) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}
