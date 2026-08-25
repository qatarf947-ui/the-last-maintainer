import test from "node:test";
import assert from "node:assert/strict";
import { buildSnapshot, verifySnapshot } from "../src/report.mjs";
import { demandScore, scoreCandidate } from "../src/scoring.mjs";
import { parseGitHubRepository } from "../src/sources.mjs";
import { buildLedger, verifyLedger } from "../src/economics.mjs";

test("demand score honors the 100k floor and saturates at 100m", () => {
  assert.equal(demandScore(100_000), 0);
  assert.equal(demandScore(100_000_000), 100);
});

test("an archived, irreplaceable, high-demand package passes adoption gate", () => {
  const result = scoreCandidate({
    downloadsMonthly: 100_000_000,
    repositoryArchived: true,
    deprecated: false,
    daysSincePublish: 1500,
    daysSincePush: 1500,
    replacementEase: 5,
    compatibilityBurden: 90,
    enterpriseFit: 90,
    licenseAllowed: true,
    latestPublishedAt: "2020-01-01T00:00:00.000Z",
    repositoryUrl: "https://github.com/example/example",
    repositoryPushedAt: "2020-01-01T00:00:00.000Z",
    license: "MIT",
  });
  assert.equal(result.decision, "ADOPT");
  assert.ok(result.score >= 75);
});

test("an incompatible license is rejected regardless of score", () => {
  const result = scoreCandidate({
    downloadsMonthly: 100_000_000,
    repositoryArchived: true,
    replacementEase: 0,
    compatibilityBurden: 100,
    enterpriseFit: 100,
    licenseAllowed: false,
  });
  assert.equal(result.decision, "REJECT");
});

test("GitHub repository references are normalized", () => {
  assert.deepEqual(parseGitHubRepository("git+https://github.com/org/repo.git"), {
    owner: "org",
    repo: "repo",
  });
});

test("snapshot digest detects mutation", () => {
  const snapshot = buildSnapshot([], "2026-08-25T00:00:00.000Z");
  assert.equal(verifySnapshot(snapshot).valid, true);
  snapshot.policy.adoptScore = 1;
  assert.equal(verifySnapshot(snapshot).valid, false);
});

test("economic ledger recognizes received cash and detects tampering", () => {
  const ledger = buildLedger([
    {
      occurredAt: "2026-08-25T00:00:00.000Z",
      type: "REVENUE_RECEIVED",
      subject: "Test contract",
      amountCents: 1200,
      currency: "USD",
      evidence: "urn:receipt:test",
      note: "Test only.",
    },
  ]);
  assert.equal(ledger.recognizedRevenueCents, 1200);
  assert.equal(verifyLedger(ledger), true);
  ledger.events[0].amountCents = 999999;
  assert.equal(verifyLedger(ledger), false);
});
