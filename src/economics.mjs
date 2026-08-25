import { digest } from "./scoring.mjs";

export function buildLedger(entries) {
  let previousHash = "GENESIS";
  const events = entries.map((entry, index) => {
    const body = {
      sequence: index + 1,
      ...entry,
      previousHash,
    };
    const event = { ...body, hash: digest(body) };
    previousHash = event.hash;
    return event;
  });

  const recognizedRevenueCents = events
    .filter((event) => event.type === "REVENUE_RECEIVED")
    .reduce((sum, event) => sum + event.amountCents, 0);

  return {
    schema: "last-maintainer/economic-ledger@1",
    recognizedRevenueCents,
    currency: "USD",
    eventCount: events.length,
    head: previousHash,
    events,
  };
}

export function verifyLedger(ledger) {
  let previousHash = "GENESIS";
  for (const event of ledger.events) {
    const { hash, ...body } = event;
    if (body.previousHash !== previousHash || digest(body) !== hash) return false;
    previousHash = hash;
  }
  const recognizedRevenueCents = ledger.events
    .filter((event) => event.type === "REVENUE_RECEIVED")
    .reduce((sum, event) => sum + event.amountCents, 0);
  return ledger.head === previousHash && ledger.recognizedRevenueCents === recognizedRevenueCents;
}
