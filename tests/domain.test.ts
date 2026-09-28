import { test } from "node:test";
import assert from "node:assert/strict";
import {
  providers,
  getQuote,
  activeOffer,
  isFresh,
  type Offer,
} from "../lib/data.ts";
import { matchProviders, resultTitle, type Answers } from "../lib/selector.ts";
import { destination } from "../lib/commercial.ts";
const now = new Date("2026-09-28T12:00:00Z");
const answers = (
  people = 4,
  meals = 3,
  priority: Answers["priority"] = "price",
): Answers => ({ people, meals, priority });
test("documented quotes preserve total, size, and delivery provenance", () => {
  assert.equal(providers.flatMap((p) => p.quotes).length, 16);
  assert.equal(getQuote(providers[0], 4, 3, now)!.boxPrice + 79, 1169);
  assert.equal(getQuote(providers[1], 2, 3, now)!.boxPrice + 79, 849);
  assert.equal(getQuote(providers[0], 3, 3, now), null);
  assert.equal(getQuote(providers[0], 4, 3, now)!.basis, "calculated-standard");
});
test("price preference can change with package and ties stay equal", () => {
  const a = matchProviders(providers, answers(), now);
  assert.equal(a[1].score, 1);
  assert.equal(a[1].priceQuote?.source.checkedAt, "2026-09-28");
  const b = matchProviders(providers, answers(4, 5), now);
  assert.equal(b[0].score, 1);
  const c = matchProviders(providers, answers(4, 4), now);
  assert.ok(c.every((m) => m.score === 0));
  assert.equal(
    resultTitle(c, answers(4, 4)),
    "Begge kan være aktuelle for dere",
  );
});
test("three portions matches only Godtlevert; seven matches neither", () => {
  const a = matchProviders(providers, answers(3), now);
  assert.deepEqual(
    a.map((m) => m.compatible),
    [true, false],
  );
  assert.match(resultTitle(a, answers(3)), /Godtlevert/);
  const b = matchProviders(providers, answers(7), now);
  assert.ok(b.every((m) => m.compatible === false && m.score === 0));
  assert.match(resultTitle(b, answers(7)), /Ingen dokumentert/);
});
test("missing or expired prices and missing delivery never create price scores", () => {
  for (const change of ["missing", "delivery", "stale"] as const) {
    const ps = structuredClone(providers);
    if (change === "missing") ps[0].quotes = [];
    if (change === "delivery")
      ps[0].quotes.forEach((q) => (q.deliveryFee = null));
    if (change === "stale")
      ps[0].quotes.forEach(
        (q) => (q.source = { ...q.source, checkedAt: "2025-01-01" }),
      );
    const m = matchProviders(ps, answers(), now);
    assert.ok(m.every((x) => x.score === 0));
    assert.ok(m.every((x) => x.priceQuote === null));
    assert.match(resultTitle(m, answers()), /kan ikke sammenligne/);
  }
});
test("expired delivery source disables a quote", () => {
  const p = structuredClone(providers[0]);
  p.quotes.forEach((q) => (q.deliverySource.checkedAt = "2025-01-01"));
  assert.equal(getQuote(p, 4, 3, now), null);
});
test("both unknown is not described as one confirmed match", () => {
  const ps = structuredClone(providers);
  ps.forEach((p) => (p.people.value = null));
  const m = matchProviders(ps, answers(), now);
  assert.ok(m.every((x) => x.compatible === null));
  assert.match(resultTitle(m, answers()), /ferskere data/);
});
test("selection preference is documented and disappears with stale data", () => {
  assert.equal(
    matchProviders(providers, answers(4, 3, "selection"), now)[0].score,
    1,
  );
  const later = new Date("2026-11-10T12:00:00Z");
  assert.ok(
    matchProviders(providers, answers(4, 3, "selection"), later).every(
      (m) => m.score === 0,
    ),
  );
});
test("commercial data cannot affect ranking and order is alphabetical", () => {
  const extra = providers.map((p) => ({
    ...p,
    commission: p.id === "hellofresh" ? 99999 : 1,
  }));
  assert.deepEqual(
    matchProviders(extra, answers(4, 5), now).map((m) => m.score),
    [1, 0],
  );
  assert.deepEqual(
    providers.map((p) => p.name),
    ["Godtlevert", "HelloFresh"],
  );
});
test("offer requires real valid dates, fresh checking, and an unexpired interval", () => {
  const o: Offer = {
    headline: "Test",
    description: "Test",
    url: "https://example.com",
    validFrom: "2026-09-01T00:00:00Z",
    validUntil: "2026-09-29T00:00:00Z",
    lastChecked: "2026-09-28",
    reviewAfterDays: 1,
  };
  assert.equal(activeOffer(o, now), o);
  assert.equal(activeOffer(o, new Date("2026-09-29T00:00:00Z")), null);
  assert.equal(activeOffer({ ...o, validUntil: "invalid" }, now), null);
  assert.equal(activeOffer({ ...o, lastChecked: "2026-08-01" }, now), null);
  assert.equal(activeOffer(null, now), null);
  assert.equal(isFresh("invalid", 30, now), false);
});
test("central outbound destination accepts only configured HTTPS tracking hosts", () => {
  const old = process.env.HELLOFRESH_AFFILIATE_URL;
  try {
    for (const raw of [
      "javascript:alert(1)",
      "https://evil.example/",
      "https://track.adtraction.com.evil.example/",
      "http://track.adtraction.com/",
    ]) {
      process.env.HELLOFRESH_AFFILIATE_URL = raw;
      assert.equal(destination("hellofresh").affiliate, false);
    }
    process.env.HELLOFRESH_AFFILIATE_URL =
      "https://track.adtraction.com/t/t?a=123";
    assert.equal(destination("hellofresh").affiliate, true);
  } finally {
    if (old === undefined) delete process.env.HELLOFRESH_AFFILIATE_URL;
    else process.env.HELLOFRESH_AFFILIATE_URL = old;
  }
});
