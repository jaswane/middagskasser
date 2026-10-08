import {
  providers,
  editorialProviders,
  getQuote,
  type Provider,
  type ProviderSlug,
  type Quote,
} from "./data.ts";
// "Cheapest" for the three råvarekasser, computed from fresh ordinary prices
// with delivery. Nothing here uses intro offers, and a quote without a known
// delivery fee is left out rather than counted as free delivery.
type P = Provider<ProviderSlug>;
export type Priced = {
  provider: P;
  quote: Quote;
  total: number;
  portions: number;
  perPortion: number;
};
const byName = (a: P, b: P) => a.name.localeCompare(b.name, "nb");
function priced(p: P, now: Date): Priced[] {
  return p.quotes
    .map((q) => getQuote(p, q.people, q.meals, now))
    .filter((q): q is Quote => q !== null && q.deliveryFee !== null)
    .map((q) => {
      const total = q.boxPrice + q.deliveryFee!;
      const portions = q.people * q.meals;
      return {
        provider: p,
        quote: q,
        total,
        portions,
        perPortion: total / portions,
      };
    });
}
const minBy = <T>(xs: T[], f: (x: T) => number) =>
  xs.reduce<T | null>((m, x) => (m === null || f(x) < f(m) ? x : m), null);
export function cheapest(now = new Date()) {
  const kits = [...providers, ...editorialProviders].sort(byName);
  const all = kits.flatMap((p) => priced(p, now));
  const perProvider = kits
    .map((p) => {
      const own = all.filter((x) => x.provider.id === p.id);
      return {
        provider: p,
        lowestTotal: minBy(own, (x) => x.total),
        lowestPerPortion: minBy(own, (x) => x.perPortion),
      };
    })
    .filter((x) => x.lowestTotal !== null);
  const lowestTotal = minBy(all, (x) => x.total);
  const lowestPerPortion = minBy(all, (x) => x.perPortion);
  // Household sizes with prices from more than one provider are compared
  // dinner by dinner; sizes only one provider offers are listed as a range.
  const sizes = [...new Set(all.map((x) => x.quote.people))].sort(
    (a, b) => a - b,
  );
  const bySize = sizes.map((people) => {
    const atSize = all.filter((x) => x.quote.people === people);
    const offering = kits.filter((p) =>
      atSize.some((x) => x.provider.id === p.id),
    );
    const meals = [...new Set(atSize.map((x) => x.quote.meals))].sort(
      (a, b) => a - b,
    );
    const rows = meals.map((m) => {
      const cells = offering.map(
        (p) =>
          atSize.find((x) => x.provider.id === p.id && x.quote.meals === m) ??
          null,
      );
      const min = Math.min(
        ...cells.filter((c) => c !== null).map((c) => c!.total),
      );
      const compared = cells.filter((c) => c !== null).length > 1;
      return {
        meals: m,
        cells: cells.map((c) => ({
          priced: c,
          cheapest: compared && c !== null && c.total === min,
        })),
      };
    });
    const totals = atSize.map((x) => x.total);
    return {
      people,
      offering,
      rows,
      min: Math.min(...totals),
      max: Math.max(...totals),
    };
  });
  const dates = [...new Set(all.map((x) => x.quote.source.checkedAt))].sort();
  // Earlier checks that found exactly the same price for a quote.
  const unchanged = all.filter((x) =>
    (x.quote.history ?? []).some(
      (h) =>
        h.boxPrice === x.quote.boxPrice &&
        h.deliveryFee === x.quote.deliveryFee,
    ),
  );
  const earlier = [
    ...new Set(
      unchanged.flatMap((x) => (x.quote.history ?? []).map((h) => h.checkedAt)),
    ),
  ].sort();
  return {
    kits,
    all,
    perProvider,
    lowestTotal,
    lowestPerPortion,
    bySize,
    dates,
    unchanged,
    earlier,
  };
}
