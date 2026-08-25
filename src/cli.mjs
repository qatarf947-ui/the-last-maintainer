#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { inspectNpmPackage } from "./sources.mjs";
import { scoreCandidate } from "./scoring.mjs";
import { buildSnapshot, renderMarkdown, verifySnapshot } from "./report.mjs";
import { buildLedger, verifyLedger } from "./economics.mjs";

const root = resolve(import.meta.dirname, "..");

async function scan() {
  const seedPath = resolve(root, "seeds", "npm-candidates.json");
  const candidates = JSON.parse(await readFile(seedPath, "utf8"));
  const results = [];

  for (const candidate of candidates) {
    process.stderr.write("Inspecting " + candidate.name + "...\n");
    try {
      const facts = await inspectNpmPackage(candidate);
      results.push({ facts, assessment: scoreCandidate(facts) });
    } catch (error) {
      results.push({
        facts: { name: candidate.name, analystNote: candidate.note, error: error.message },
        assessment: { score: 0, decision: "ERROR", confidence: 0, signals: {} },
      });
    }
  }

  const snapshot = buildSnapshot(results);
  await mkdir(resolve(root, "reports"), { recursive: true });
  await writeFile(
    resolve(root, "reports", "latest.json"),
    JSON.stringify(snapshot, null, 2) + "\n",
  );
  await writeFile(resolve(root, "reports", "latest.md"), renderMarkdown(snapshot));

  console.log(renderMarkdown(snapshot));
}

async function verify(pathArgument) {
  const path = resolve(process.cwd(), pathArgument ?? "reports/latest.json");
  const snapshot = JSON.parse(await readFile(path, "utf8"));
  const result = verifySnapshot(snapshot);
  console.log(JSON.stringify(result, null, 2));
  if (!result.valid) process.exitCode = 1;
}

async function ledger() {
  const eventPath = resolve(root, "seeds", "economic-events.json");
  const entries = JSON.parse(await readFile(eventPath, "utf8"));
  const economicLedger = buildLedger(entries);
  await mkdir(resolve(root, "reports"), { recursive: true });
  await writeFile(
    resolve(root, "reports", "economic-ledger.json"),
    JSON.stringify(economicLedger, null, 2) + "\n",
  );
  console.log(
    JSON.stringify(
      {
        valid: verifyLedger(economicLedger),
        eventCount: economicLedger.eventCount,
        recognizedRevenueCents: economicLedger.recognizedRevenueCents,
        head: economicLedger.head,
      },
      null,
      2,
    ),
  );
}

const [command = "scan", argument] = process.argv.slice(2);
if (command === "scan") await scan();
else if (command === "ledger") await ledger();
else if (command === "verify") await verify(argument);
else {
  console.error("Unknown command: " + command);
  process.exitCode = 1;
}
