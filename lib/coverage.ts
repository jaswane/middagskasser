import {
  allProviders,
  isFresh,
  formatDate,
  numberWord,
  type Provider,
  type ProviderSlug,
} from "./data.ts";
import {
  places,
  regions,
  deliveryChecks,
  type DeliveryCheck,
  type Place,
} from "./delivery.ts";
// How a delivery check is shown. Old checks are never shown as current, and
// an address-dependent answer is never shown as "yes".
export type CellKind =
  | "delivers"
  | "no-delivery"
  | "address-required"
  | "not-public"
  | "stale"
  | "missing";
export const cellLabel: Record<CellKind, string> = {
  delivers: "Ja",
  "no-delivery": "Nei",
  "address-required": "Avhenger av adressen",
  "not-public": "Ikke offentlig",
  stale: "Må kontrolleres på nytt",
  missing: "Ikke kontrollert",
};
// Delivery fees are prices and follow the 30-day price rule.
const feeReviewDays = 30;
const byName = (a: { name: string }, b: { name: string }) =>
  a.name.localeCompare(b.name, "nb");
export const coverageProviders = () =>
  [...allProviders]
    .filter((p) => deliveryChecks.some((c) => c.provider === p.id))
    .sort(byName);
export function findCheck(provider: ProviderSlug, postcode: string) {
  return deliveryChecks.find(
    (c) => c.provider === provider && c.postcode === postcode,
  );
}
export function cellView(
  check: DeliveryCheck | undefined,
  now = new Date(),
): { kind: CellKind; days: string | null; checkedAt: string | null } {
  if (!check) return { kind: "missing", days: null, checkedAt: null };
  if (!isFresh(check.source.checkedAt, check.reviewAfterDays, now))
    return { kind: "stale", days: null, checkedAt: check.source.checkedAt };
  const days =
    check.status === "delivers" && check.days
      ? check.days.map((d) => `${d.day} ${d.windows.join(", ")}`).join(" · ")
      : null;
  return { kind: check.status, days, checkedAt: check.source.checkedAt };
}
export function feeFresh(check: DeliveryCheck, now = new Date()) {
  return (
    check.fee !== null &&
    isFresh((check.feeSource ?? check.source).checkedAt, feeReviewDays, now)
  );
}
// Counts over fresh checks only.
export function providerCoverage(p: Provider<ProviderSlug>, now = new Date()) {
  const fresh = deliveryChecks.filter(
    (c) =>
      c.provider === p.id &&
      isFresh(c.source.checkedAt, c.reviewAfterDays, now),
  );
  const count = (s: DeliveryCheck["status"]) =>
    fresh.filter((c) => c.status === s).length;
  return {
    checked: fresh.length,
    delivers: count("delivers"),
    addressRequired: count("address-required"),
    noDelivery: count("no-delivery"),
    checkedAt: fresh.length
      ? [...new Set(fresh.map((c) => c.source.checkedAt))].sort().at(-1)!
      : null,
  };
}
// One sentence for a provider page, or null without fresh checks. It speaks
// about the sampled postcodes only, never about the whole country.
export function coverageSentence(p: Provider<ProviderSlug>, now = new Date()) {
  const c = providerCoverage(p, now);
  if (!c.checked || !c.checkedAt) return null;
  return `Vi sjekket ${c.checked} postnumre rundt om i landet ${formatDate(c.checkedAt)}. ${p.name} leverte til ${numberWord(c.delivers)} av dem${c.addressRequired ? `, og for ${numberWord(c.addressRequired)} ba leveringssjekken om full adresse` : ""}.`;
}
export function placesByRegion() {
  return regions
    .map((region) => ({
      region,
      places: places.filter((p) => p.region === region),
    }))
    .filter((g) => g.places.length);
}
// Places where the providers gave different answers, and where none of them
// delivered. Built from fresh checks only.
export function contrasts(now = new Date()) {
  const ps = coverageProviders();
  const kinds = (pl: Place) =>
    ps.map((p) => cellView(findCheck(p.id, pl.postcode), now).kind);
  const usable = places.filter((pl) =>
    kinds(pl).every((k) => k !== "stale" && k !== "missing"),
  );
  return {
    differ: usable
      .filter((pl) => new Set(kinds(pl)).size > 1)
      .map((pl) => pl.place)
      .sort((a, b) => a.localeCompare(b, "nb")),
    none: usable.filter((pl) => kinds(pl).every((k) => k === "no-delivery")),
  };
}
