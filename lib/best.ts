import {
  providers,
  editorialProviders,
  readFact,
  getQuote,
  priceTally,
  numberWord,
  listJoin,
  type Provider,
  type ProviderSlug,
} from "./data.ts";
import { market } from "./market.ts";
// Which råvarekasse stands out for which need, derived only from fresh,
// sourced data. Nothing here is a test result or a score: a cell says whether
// a provider has a documented advantage, offers the option, or does not.
export type Mark = "best" | "yes" | "no";
export type Cell = { mark: Mark; detail: string };
export type NeedRow = {
  id: string;
  need: string;
  note?: string;
  cells: Record<string, Cell>;
};
type P = Provider<ProviderSlug>;
const byName = (a: P, b: P) => a.name.localeCompare(b.name, "nb");
const menuOf = (p: P) => market.find((m) => m.profile === p.id)?.menu;
const range = (n: number[]) =>
  n.length > 2 && n[n.length - 1] - n[0] + 1 === n.length
    ? `${n[0]}–${n[n.length - 1]}`
    : listJoin(n.map(String), "eller");
// Total with delivery for every size all given providers offer.
function sharedTotals(ps: P[], now: Date) {
  return ps[0].quotes
    .map((q) => {
      const totals = ps.map((p) => {
        const x = getQuote(p, q.people, q.meals, now);
        return x && x.deliveryFee !== null ? x.boxPrice + x.deliveryFee : null;
      });
      return totals.every((t) => t !== null)
        ? { people: q.people, meals: q.meals, totals: totals as number[] }
        : null;
    })
    .filter((x) => x !== null);
}
export function bestByNeed(now = new Date()) {
  const kits = [...providers, ...editorialProviders].sort(byName);
  const [gl, hf] = [...providers].sort(byName);
  const fixed = kits.filter((p) => menuOf(p) === "fixed");
  const people = Object.fromEntries(
    kits.map((p) => [p.id, readFact(p.people, now)]),
  );
  const meals = Object.fromEntries(
    kits.map((p) => [p.id, readFact(p.meals, now)]),
  );
  const counts = Object.fromEntries(
    kits.map((p) => [p.id, readFact(p.selectionCount, now)]),
  );
  const tally = priceTally(hf, gl, now);
  const shared = sharedTotals(kits, now);
  const rows: NeedRow[] = [];
  // Price: HelloFresh and Godtlevert share eight sizes; all three share fewer.
  if (tally.total > 0 && shared.length > 0) {
    const wins = { [hf.id]: tally.aWins, [gl.id]: tally.bWins };
    const cells: Record<string, Cell> = {};
    for (const p of [gl, hf])
      cells[p.id] = {
        mark:
          wins[p.id] > wins[p.id === hf.id ? gl.id : hf.id] ? "best" : "yes",
        detail: `Billigst i ${numberWord(wins[p.id])} av ${numberWord(tally.total)}`,
      };
    for (const p of fixed) {
      const i = kits.indexOf(p);
      const dearest = shared.filter(
        (s) => s.totals[i] === Math.max(...s.totals),
      ).length;
      cells[p.id] = {
        mark: dearest === shared.length ? "no" : "yes",
        detail:
          dearest === shared.length
            ? shared.length === 2
              ? "Dyrest i begge"
              : `Dyrest i alle ${numberWord(shared.length)}`
            : `Dyrest i ${numberWord(dearest)} av ${numberWord(shared.length)}`,
      };
    }
    rows.push({
      id: "pris",
      need: "Lavest ukepris",
      note: "To eller fire porsjoner, med frakt",
      cells,
    });
  }
  // Household sizes that only some providers offer.
  if (kits.every((p) => people[p.id])) {
    const all = [...new Set(kits.flatMap((p) => people[p.id]!))].sort(
      (a, b) => a - b,
    );
    const common = all.filter((n) =>
      kits.every((p) => people[p.id]!.includes(n)),
    );
    const extra = all.filter((n) => !common.includes(n));
    if (extra.length) {
      const offers = kits.filter((p) =>
        extra.some((n) => people[p.id]!.includes(n)),
      );
      rows.push({
        id: "storrelse",
        need: `${listJoin(extra.map(numberWord), "eller")} porsjoner`.replace(
          /^./,
          (c) => c.toUpperCase(),
        ),
        cells: Object.fromEntries(
          kits.map((p) => {
            const has = extra.filter((n) => people[p.id]!.includes(n));
            const unit = menuOf(p) === "fixed" ? "voksne" : "porsjoner";
            return [
              p.id,
              {
                mark: !has.length
                  ? "no"
                  : offers.length === 1 && has.length === extra.length
                    ? "best"
                    : "yes",
                detail: `${has.length ? "" : "Bare "}${range(people[p.id]!)} ${unit}`,
              },
            ];
          }),
        ),
      });
    }
  }
  // Stated selection: only providers where customers choose dishes.
  const choosers = kits.filter((p) => menuOf(p) === "choose");
  if (choosers.every((p) => counts[p.id])) {
    const max = Math.max(...choosers.map((p) => counts[p.id]!));
    rows.push({
      id: "utvalg",
      need: "Flest retter å velge mellom",
      note: "Leverandørenes egne tall",
      cells: Object.fromEntries(
        kits.map((p) => [
          p.id,
          menuOf(p) === "fixed"
            ? { mark: "no", detail: "Fast meny" }
            : {
                mark: counts[p.id] === max ? "best" : "yes",
                detail: `Oppgir ${counts[p.id]} retter`,
              },
        ]),
      ),
    });
  }
  // Four or five dinners a week.
  if (kits.every((p) => meals[p.id])) {
    const offers = kits.filter((p) =>
      meals[p.id]!.some((m) => m === 4 || m === 5),
    );
    rows.push({
      id: "middager",
      need: "Fire eller fem middager i uken",
      cells: Object.fromEntries(
        kits.map((p) => [
          p.id,
          offers.includes(p)
            ? {
                mark: offers.length === 1 ? "best" : "yes",
                detail: `${range(meals[p.id]!)} middager`,
              }
            : {
                mark: "no",
                detail: `Alltid ${numberWord(meals[p.id]![0])}`,
              },
        ]),
      ),
    });
  }
  // A fixed menu set by someone else.
  if (fixed.length && choosers.length)
    rows.push({
      id: "fast-meny",
      need: "Slippe å velge retter",
      cells: Object.fromEntries(
        kits.map((p) => [
          p.id,
          menuOf(p) === "fixed"
            ? {
                mark: fixed.length === 1 ? "best" : "yes",
                detail: "Kokken setter menyen",
              }
            : { mark: "no", detail: "Dere velger selv" },
        ]),
      ),
    });
  // Choosing vegetarian dinners from the weekly menu.
  if (choosers.every((p) => readFact(p.vegetarian, now)))
    rows.push({
      id: "vegetar",
      need: "Velge vegetarmiddager",
      cells: Object.fromEntries(
        kits.map((p) => [
          p.id,
          menuOf(p) === "fixed"
            ? { mark: "no", detail: "Ingen vegetarkasse" }
            : { mark: "yes", detail: "Vegetarretter på menyen" },
        ]),
      ),
    });
  // Extra cost of a fixed-menu box in the sizes all three offer.
  const premium = fixed.map((p) => {
    const i = kits.indexOf(p);
    const diffs = shared.map(
      (s) => s.totals[i] - Math.min(...s.totals.filter((_, j) => j !== i)),
    );
    return { provider: p, min: Math.min(...diffs), max: Math.max(...diffs) };
  });
  return {
    kits,
    gl,
    hf,
    fixed,
    rows,
    tally,
    shared,
    premium: shared.length ? premium : [],
    counts,
    people,
    checkedAt: tally.checkedAt,
  };
}
