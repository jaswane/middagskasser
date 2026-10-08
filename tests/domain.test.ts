import { test } from "node:test";
import assert from "node:assert/strict";
import {
  providers,
  editorialProviders,
  getProvider,
  getEditorialProvider,
  getQuote,
  activeOffer,
  isFresh,
  type Offer,
} from "../lib/data.ts";
import { matchProviders, resultTitle, type Answers } from "../lib/selector.ts";
import { destination } from "../lib/commercial.ts";
// Same day as the latest price check.
const now = new Date("2026-10-08T12:00:00Z");
const answers = (
  people = 4,
  meals = 3,
  priority: Answers["priority"] = "price",
): Answers => ({ people, meals, priority });
test("documented quotes preserve total, size, and delivery provenance", () => {
  assert.equal(providers.flatMap((p) => p.quotes).length, 28);
  assert.equal(getQuote(providers[0], 4, 3, now)!.boxPrice + 79, 1169);
  assert.equal(getQuote(providers[1], 2, 3, now)!.boxPrice + 79, 849);
  assert.equal(getQuote(providers[0], 3, 3, now)!.boxPrice, 1010);
  assert.equal(getQuote(providers[1], 3, 3, now), null);
  assert.equal(getQuote(providers[0], 4, 3, now)!.basis, "calculated-standard");
});
test("Godtlevert has a dated price for every offered size and nothing beyond", () => {
  const g = getProvider("godtlevert")!;
  for (const people of [2, 3, 4, 5, 6])
    for (const meals of [2, 3, 4, 5]) {
      const q = getQuote(g, people, meals, now);
      assert.ok(q, `${people} x ${meals}`);
      assert.equal(q.source.checkedAt, "2026-10-08");
    }
  assert.equal(getQuote(g, 7, 3, now), null);
  assert.equal(getQuote(g, 4, 6, now), null);
});
test("prices disappear everywhere when the check is older than 30 days", () => {
  const expired = new Date("2026-11-08T12:00:00Z");
  for (const p of [...providers, ...editorialProviders])
    for (const q of p.quotes)
      assert.equal(getQuote(p, q.people, q.meals, expired), null);
  const m = matchProviders(providers, answers(), expired);
  assert.ok(m.every((x) => x.priceQuote === null && x.score === 0));
});
test("delivery samples are tied to a postcode and never stand in for a fee", () => {
  for (const p of [...providers, ...editorialProviders]) {
    assert.deepEqual(
      p.deliverySamples?.map((s) => s.postcode),
      ["0150", "5003", "7010"],
    );
    for (const s of p.deliverySamples!)
      assert.equal(s.source.checkedAt, "2026-10-08");
  }
  // Godtlevert hides the address fee, so its samples have no fee.
  assert.ok(
    getProvider("godtlevert")!.deliverySamples!.every((s) => s.fee === null),
  );
});
test("price preference can change with package and ties stay equal", () => {
  const a = matchProviders(providers, answers(), now);
  assert.equal(a[1].score, 1);
  assert.equal(a[1].priceQuote?.source.checkedAt, "2026-10-08");
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
  const during = new Date("2026-09-28T12:00:00Z");
  assert.equal(activeOffer(o, during), o);
  assert.equal(activeOffer(o, new Date("2026-09-29T00:00:00Z")), null);
  assert.equal(activeOffer({ ...o, validUntil: "invalid" }, during), null);
  assert.equal(activeOffer({ ...o, lastChecked: "2026-08-01" }, during), null);
  assert.equal(activeOffer(null, during), null);
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
test("editorial providers stay out of the selector, the comparison and /go/", () => {
  assert.deepEqual(
    providers.map((p) => p.id),
    ["godtlevert", "hellofresh"],
  );
  assert.ok(providers.every((p) => p.tier === "core"));
  assert.deepEqual(
    editorialProviders.map((p) => p.id),
    ["kokkeloren"],
  );
  assert.ok(editorialProviders.every((p) => p.tier === "editorial"));
  // /go/ only resolves core providers, so there is no redirect for Kokkeløren.
  assert.equal(getProvider("kokkeloren"), undefined);
  for (const people of [2, 3, 4])
    for (const meals of [2, 3, 4, 5])
      assert.deepEqual(
        matchProviders(providers, answers(people, meals), now).map(
          (m) => m.provider.id,
        ),
        ["godtlevert", "hellofresh"],
      );
});
test("Kokkeløren facts are sourced, dated and leave unknown fields unknown", () => {
  const k = getEditorialProvider("kokkeloren")!;
  const checked = new Date("2026-10-08T12:00:00Z");
  assert.deepEqual(k.people.value, [2, 4]);
  assert.deepEqual(k.meals.value, [3]);
  assert.equal(k.selectionCount.value, null);
  assert.equal(k.quick.value, null);
  assert.equal(getQuote(k, 2, 3, checked)!.boxPrice, 1049);
  assert.equal(getQuote(k, 4, 3, checked)!.boxPrice, 1449);
  assert.equal(getQuote(k, 4, 3, checked)!.deliveryFee, 79);
  assert.equal(getQuote(k, 2, 4, checked), null);
  for (const s of k.sources) {
    assert.ok(s.url.startsWith("https://kokkeloren.no/"), s.url);
    assert.equal(s.checkedAt, "2026-10-08");
  }
});
test("market overview: sourced entries, every profile included, order ignores commercial status", async () => {
  const { market, marketByType, closed } = await import("../lib/market.ts");
  const { allProviders } = await import("../lib/data.ts");
  for (const e of [
    ...market.flatMap((m) => m.sources),
    ...closed.map((c) => c.source),
  ]) {
    assert.match(e.url, /^https:\/\//, e.url);
    assert.match(e.checkedAt, /^\d{4}-\d{2}-\d{2}$/, e.url);
  }
  for (const p of allProviders)
    assert.ok(
      market.some((m) => m.profile === p.id),
      `${p.id} missing in overview`,
    );
  for (const m of market.filter((m) => !m.profile)) assert.ok(m.facts, m.id);
  const names = (entries: typeof market) =>
    marketByType(entries).flatMap((g) => g.entries.map((e) => e.name));
  // Flipping every commercial relationship must not change the order.
  const flipped = market.map((m) => ({
    ...m,
    commercial:
      m.commercial === "affiliate" ? ("none" as const) : ("affiliate" as const),
  }));
  assert.deepEqual(names(flipped), names(market));
  for (const g of marketByType())
    assert.deepEqual(
      g.entries.map((e) => e.name),
      [...g.entries.map((e) => e.name)].sort((a, b) =>
        a.localeCompare(b, "nb"),
      ),
    );
});
