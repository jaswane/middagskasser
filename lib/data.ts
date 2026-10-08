import { deliveryChecks, places } from "./delivery.ts";
// Core providers: main comparison, selector and the central /go/ flow.
export type ProviderId = "godtlevert" | "hellofresh";
// Editorial providers: own page and shown as an alternative, with a plain
// link to the provider. Not part of the selector or the side-by-side table.
export type EditorialProviderId = "kokkeloren";
export type ProviderSlug = ProviderId | EditorialProviderId;
// Which parts of the site a provider takes part in. Commercial agreements do
// not set this: coverage depends on whether the provider is a relevant choice
// and how comparable its documented facts are.
export type ProviderTier = "core" | "editorial";
export type Source = { url: string; title: string; checkedAt: string };
export type Fact<T> = {
  value: T | null;
  source: Source;
  reviewAfterDays: number;
  note?: string;
};
// A price as seen at one earlier check. Never shown as the current price.
export type PricePoint = {
  checkedAt: string;
  boxPrice: number;
  deliveryFee: number | null;
};
export type Quote = {
  people: number;
  meals: number;
  boxPrice: number;
  deliveryFee: number | null;
  deliverySource: Source;
  basis: "observed-checkout" | "calculated-standard";
  addressNote: string;
  kind: "regular";
  currency: "NOK";
  source: Source;
  reviewAfterDays: number;
  // Earlier checks, oldest first. When a check finds a new price, move the
  // current values here before updating them.
  history?: PricePoint[];
};
export type DeliverySample = {
  postcode: string;
  place: string;
  // null: delivery offered but fee not shown; available false: no delivery.
  fee: number | null;
  available: boolean;
  source: Source;
  note?: string;
};
export type Offer = {
  headline: string;
  description: string;
  code?: string;
  url: string;
  validFrom: string;
  validUntil: string;
  lastChecked: string;
  reviewAfterDays: number;
};
// Provider-written page copy for editorial providers. Each line must rest on
// the facts and sources of the same provider.
export type EditorialProfile = {
  title: string;
  metaDescription: string;
  summary: string;
  fitFor: string;
  difference: string;
  strength: string;
  limitation: string;
  alternative: string;
  homeHeading: string;
  homeTeaser: string;
};
export type Provider<Id extends ProviderSlug = ProviderId> = {
  id: Id;
  tier: ProviderTier;
  name: string;
  websiteUrl: string;
  description: string;
  color: string;
  people: Fact<number[]>;
  meals: Fact<number[]>;
  selection: Fact<string>;
  selectionCount: Fact<number>;
  quick: Fact<string>;
  vegetarian: Fact<string>;
  flexibility: Fact<string>;
  delivery: Fact<string>;
  // Provider-stated coverage and delivery windows. Shown on provider pages,
  // never as a promise for a specific address.
  coverage?: Fact<string>;
  deliveryWindows?: Fact<string>;
  // Delivery fee observed for specific postcodes. Never a national price.
  deliverySamples?: DeliverySample[];
  // Provider-documented extra charges for certain dishes.
  surcharge?: Fact<string>;
  quotes: Quote[];
  offer: Offer | null;
  strengths: string[];
  limitations: string[];
  sources: Source[];
  editorial?: EditorialProfile;
};
const date = "2026-09-28";
const source = (url: string, title: string, checkedAt = date): Source => ({
  url,
  title,
  checkedAt,
});
const gs = source("https://www.godtlevert.no/", "Godtlevert – egen nettside");
const hs = source("https://www.hellofresh.no/", "HelloFresh – egen nettside");
// Prices, sizes and standard delivery re-checked the same day for all
// providers on 2026-10-08. Ordinary prices only; intro offers are excluded.
const priceDate = "2026-10-08";
const gp = source(
  "https://www.godtlevert.no/velg-matkasse",
  "Godtlevert – pris og kassestørrelser",
  priceDate,
);
const hp = source(
  "https://www.hellofresh.no/plans",
  "HelloFresh – planvalg, postnummer 0150",
  priceDate,
);
const gf = source(
  "https://tips.godtlevert.no/nb/articles/16068043-avgifter-og-prisjusteringer",
  "Godtlevert – oppgitt standardfrakt",
  priceDate,
);
const hfaq = source(
  "https://www.hellofresh.no/about/faq",
  "HelloFresh – ofte stilte spørsmål",
  priceDate,
);
// Delivery fee seen for the same three postcodes at every provider.
// Postcodes used as delivery-fee samples on the price pages. The data comes
// from the delivery checks in lib/delivery.ts.
const feeSamplePostcodes = ["0150", "5003", "7010"];
function samplesFrom(id: ProviderSlug): DeliverySample[] {
  return feeSamplePostcodes.flatMap((postcode) => {
    const c = deliveryChecks.find(
      (x) => x.provider === id && x.postcode === postcode,
    );
    const place = places.find((x) => x.postcode === postcode)?.place;
    if (!c || !place) return [];
    return [
      {
        postcode,
        place,
        fee: c.feeBasis === "observed" ? c.fee : null,
        available: c.status === "delivers",
        source: c.source,
      },
    ];
  });
}
const gt = source("https://www.godtlevert.no/vilkar", "Godtlevert – vilkår");
const ht = source(
  "https://www.hellofresh.no/about/termsandconditions",
  "HelloFresh – vilkår",
);
// Kokkeløren, checked 2026-10-08. kp is the order picker with postcode 0150.
const kokkelorenDate = "2026-10-08";
const kv = source(
  "https://kokkeloren.no/var-matkasse",
  "Kokkeløren – vår matkasse",
  kokkelorenDate,
);
const kf = source(
  "https://kokkeloren.no/faq",
  "Kokkeløren – ofte stilte spørsmål",
  kokkelorenDate,
);
const kt = source(
  "https://kokkeloren.no/vilkar-og-garantier",
  "Kokkeløren – vilkår og garantier",
  kokkelorenDate,
);
const kp = source(
  "https://kokkeloren.no/kasse/abonnement/matkasse",
  "Kokkeløren – bestilling, postnummer 0150",
  kokkelorenDate,
);
function fact<T>(value: T | null, source: Source, note?: string): Fact<T> {
  return { value, source, reviewAfterDays: 90, note };
}
// Each row is one portion size with box prices for 2, 3, 4 and 5 dinners.
// `same` lists earlier checks that found the same box price and fee for the
// given portion sizes.
function quotes(
  id: ProviderId,
  rows: [number, number[]][],
  same: { checkedAt: string; people: number[] }[] = [],
): Quote[] {
  return rows.flatMap(([people, values]) =>
    values.map((boxPrice, j) => ({
      history: same
        .filter((s) => s.people.includes(people))
        .map((s) => ({ checkedAt: s.checkedAt, boxPrice, deliveryFee: 79 })),
      people,
      meals: j + 2,
      boxPrice,
      deliveryFee: 79,
      deliverySource: id === "godtlevert" ? gf : hp,
      basis: id === "godtlevert" ? "calculated-standard" : "observed-checkout",
      addressNote:
        id === "godtlevert"
          ? "Beregnet med standardfrakt. Adressepris er ikke bekreftet."
          : "Observert for postnummer 0150. Andre adresser må sjekkes.",
      kind: "regular",
      currency: "NOK",
      source: id === "godtlevert" ? gp : hp,
      reviewAfterDays: 30,
    })),
  );
}
// All providers we cover. The tier decides where each one appears.
const catalog: Provider<ProviderSlug>[] = [
  {
    id: "godtlevert",
    tier: "core",
    name: "Godtlevert",
    websiteUrl: "https://www.godtlevert.no/",
    color: "orange",
    description: "Flere porsjonsstørrelser og et stort oppgitt utvalg.",
    people: fact([2, 3, 4, 5, 6], gp),
    meals: fact([2, 3, 4, 5], gp),
    selection: fact("Velg selv fra ukens retter", gs),
    selectionCount: {
      ...fact(
        150,
        source(
          "https://www.godtlevert.no/",
          "Godtlevert – egen nettside",
          priceDate,
        ),
        "Leverandøroppgitt. Eldre sider oppgir andre tall. Ikke en uavhengig telling.",
      ),
      reviewAfterDays: 30,
    },
    quick: fact(
      "Raske alternativer",
      source(
        "https://www.godtlevert.no/matkasse/raskeretter",
        "Godtlevert – raske retter",
      ),
    ),
    vegetarian: fact(
      "Vegetariske alternativer",
      source(
        "https://www.godtlevert.no/matkasse/vegetar",
        "Godtlevert – vegetar",
      ),
    ),
    flexibility: fact("Ingen binding. Endres før ukens frist.", gt),
    delivery: fact(
      "Adresseavhengig. Sjekk postnummer.",
      source(
        "https://tips.godtlevert.no/nb/articles/16068360-leveringstider-og-leveringsdager",
        "Godtlevert – levering",
      ),
    ),
    coverage: fact(
      "Godtlevert oppgir at de leverer til 90 % av husstandene i Norge.",
      source(
        "https://www.godtlevert.no/",
        "Godtlevert – egen nettside",
        "2026-10-08",
      ),
    ),
    deliveryWindows: fact(
      "I de største områdene leverer de lørdag, søndag eller mandag i faste tidsvinduer. Hvilke tider dere kan velge, avhenger av postnummeret.",
      source(
        "https://tips.godtlevert.no/nb/articles/16068360-leveringstider-og-leveringsdager",
        "Godtlevert – leveringstider og leveringsdager",
        "2026-10-08",
      ),
    ),
    // Godtlevert shows delivery days for a postcode, but not the fee for an
    // address before an account is created. 79 kr is their stated standard.
    deliverySamples: samplesFrom("godtlevert"),
    surcharge: {
      ...fact(
        "Enkelte retter med dyrere råvarer har pluspris, som kommer i tillegg til prisen på kassen. Beløpet står ved retten.",
        gf,
      ),
      reviewAfterDays: 30,
    },
    quotes: quotes(
      "godtlevert",
      [
        [2, [690, 860, 1020, 1190]],
        [3, [820, 1010, 1180, 1330]],
        [4, [910, 1090, 1270, 1410]],
        [5, [1030, 1310, 1510, 1680]],
        [6, [1110, 1370, 1560, 1750]],
      ],
      // 3, 5 and 6 portions were first checked 2026-10-08.
      [{ checkedAt: "2026-09-28", people: [2, 4] }],
    ),
    offer: null,
    strengths: [
      "Dokumenterte porsjonsvalg fra 2 til 6.",
      "Oppgir flere retter å velge mellom enn HelloFresh.",
    ],
    // The first limitation is shown as the most important one.
    limitations: [
      "Frakten for adressen deres ser dere først når dere har laget konto. Priseksemplene her bruker Godtleverts oppgitte standardfrakt.",
      "Flere retter betyr ikke nødvendigvis flere retter som passer dere.",
    ],
    sources: [gs, gp, gf, gt],
  },
  {
    id: "hellofresh",
    tier: "core",
    name: "HelloFresh",
    websiteUrl: "https://www.hellofresh.no/",
    color: "green",
    description: "To eller fire porsjoner, med en ny meny hver uke.",
    people: fact([2, 4], hp),
    meals: fact([2, 3, 4, 5], hp),
    selection: fact("Velg selv fra ukens retter", hs),
    selectionCount: {
      ...fact(
        50,
        source(
          "https://www.hellofresh.no/",
          "HelloFresh – egen nettside",
          priceDate,
        ),
        "Leverandøroppgitt. Eldre sider oppgir andre tall. Ikke en uavhengig telling.",
      ),
      reviewAfterDays: 30,
    },
    quick: fact(
      "Raske alternativer",
      source("https://www.hellofresh.no/menus", "HelloFresh – aktuell meny"),
    ),
    vegetarian: fact(
      "Vegetariske alternativer",
      source("https://www.hellofresh.no/menus", "HelloFresh – aktuell meny"),
    ),
    flexibility: fact("Ingen binding. Endres før ukens frist.", ht),
    delivery: fact("Adresseavhengig. Sjekk postnummer.", hp),
    coverage: fact(
      "HelloFresh oppgir at de leverer de fleste steder i Norge.",
      source(
        "https://www.hellofresh.no/about/how-it-works",
        "HelloFresh – slik fungerer det",
        "2026-10-08",
      ),
    ),
    deliveryWindows: fact(
      "Levering skjer fra lørdag til tirsdag i oppgitte tidsvinduer, og tidspunktet varierer med hvor i landet dere bor.",
      source(
        "https://www.hellofresh.no/about/how-it-works",
        "HelloFresh – slik fungerer det",
        "2026-10-08",
      ),
    ),
    deliverySamples: samplesFrom("hellofresh"),
    surcharge: {
      ...fact(
        "Enkelte spesialretter, for eksempel med premiumingredienser eller større porsjoner, koster mer per porsjon og belastes i tillegg til kasseprisen. Noen leveringstidspunkter koster også ekstra, og tillegget endrer seg fra uke til uke.",
        hfaq,
      ),
      reviewAfterDays: 30,
    },
    quotes: quotes(
      "hellofresh",
      [
        [2, [660, 770, 960, 1150]],
        [4, [890, 1060, 1270, 1440]],
      ],
      [{ checkedAt: "2026-09-28", people: [2, 4] }],
    ),
    offer: null,
    strengths: [
      "Lavere standardpris i flere av de kontrollerte pakkestørrelsene.",
      "Du velger retter og kan hoppe over uker.",
    ],
    // The first limitation is shown as the most important one.
    limitations: [
      "Kassen finnes bare for to eller fire porsjoner per middag. Er dere tre, fem eller seks, blir den enten for liten eller for stor.",
    ],
    sources: [hs, hp, ht],
  },
  {
    id: "kokkeloren",
    tier: "editorial",
    name: "Kokkeløren",
    websiteUrl: "https://kokkeloren.no/",
    color: "ink",
    description: "Én fast meny med tre middager i uken, satt sammen av kokken.",
    people: fact(
      [2, 4],
      kp,
      "Det finnes også en kasse for to voksne og to små barn. Kokkeløren oppgir ikke hvor mange porsjoner den gir, så den er ikke med i prissammenligningen.",
    ),
    meals: fact([3], kf),
    selection: fact(
      "Fast meny satt sammen av kokken. Retter kan ikke byttes eller velges bort.",
      kf,
    ),
    selectionCount: fact<number>(
      null,
      kv,
      "Ikke sammenlignbart: menyen er fast, så det finnes ingen meny å velge fra.",
    ),
    quick: fact<string>(
      null,
      kf,
      "Hvor lang tid rettene tar, oppgir Kokkeløren ulikt: vanligvis 20–60 minutter i spørsmål og svar, og 25–40 minutter for de fleste retter på produktsiden.",
    ),
    vegetarian: fact(
      "Menyen kan ha vegetarretter, men det finnes ikke et eget vegetarabonnement. Kassen tilpasses ikke allergier eller dietter.",
      kf,
    ),
    flexibility: fact(
      "Ingen binding. Pause eller avbestill før søndag kl. 23.59.",
      kt,
    ),
    delivery: fact("Oppgitt område. Sjekk postnummer.", kf),
    coverage: fact(
      "Kokkeløren oppgir at de leverer fra Kristiansand i sør til Alta i nord.",
      kf,
    ),
    deliveryWindows: fact(
      "Levering skjer fredag til tirsdag, avhengig av hvor dere bor. For postnummer 0150 kunne vi velge alle fem dagene, i tidsvinduer mellom kl. 09 og 22.",
      kp,
    ),
    deliverySamples: samplesFrom("kokkeloren"),
    // Observed in the order picker for postcode 0150 on 2026-10-08. Only the
    // sizes that match 2 or 4 portions are recorded; three dinners is fixed.
    // The box for two adults and two small children (1 249 kr) is left out
    // because its portion count is not documented.
    quotes: [
      [2, 1049],
      [4, 1449],
    ].map(([people, boxPrice]) => ({
      people,
      meals: 3,
      boxPrice,
      deliveryFee: 79,
      deliverySource: kp,
      basis: "observed-checkout" as const,
      addressNote: "Observert for postnummer 0150. Andre adresser må sjekkes.",
      kind: "regular" as const,
      currency: "NOK" as const,
      source: kp,
      reviewAfterDays: 30,
    })),
    offer: null,
    strengths: [
      "Ingen retter å velge mellom: menyen er satt sammen av kokken.",
      "Ingen binding, og levering hver uke eller annenhver uke.",
    ],
    limitations: [
      "Retter kan ikke byttes eller velges bort.",
      "Ingen vegetarabonnement og ingen tilpasning til allergier eller dietter.",
      "Alltid tre middager, og bare tre kassestørrelser.",
    ],
    sources: [kv, kf, kt, kp],
    editorial: {
      title: "Kokkeløren matkasse: pris, meny og vilkår",
      metaDescription:
        "Kokkeløren sender én fast meny med tre middager i uken. Se pris, levering og vilkår, og hvordan den skiller seg fra HelloFresh og Godtlevert.",
      summary:
        "Kokkeløren er en matkasse med én fast meny: tre middager i uken som kokken har satt sammen, og som dere ikke kan bytte ut. Den kan passe for dere som vil slippe å velge retter. I de to pakkene vi kan sammenligne direkte, er den dyrere enn HelloFresh og Godtlevert, som også lar dere velge rettene selv.",
      fitFor:
        "To eller fire voksne som spiser det meste og klarer seg med tre middager i uken.",
      difference:
        "Kokkeløren sender én meny i uken i stedet for en lang meny dere velger fra. Ifølge Kokkeløren lager de sausene selv og bruker navngitte produsenter.",
      strength:
        "Menyen er bestemt for dere, og kassen kommer hver uke eller annenhver uke uten binding.",
      limitation:
        "Dere kan ikke bytte ut eller velge bort retter, og kassen tilpasses ikke allergier, dietter eller vegetarkost. Det finnes bare tre størrelser, og alltid tre middager.",
      alternative:
        "Trenger dere å velge retter selv, unngå bestemte ingredienser, ha fire eller fem middager i uken eller holde prisen nede, passer HelloFresh eller Godtlevert bedre.",
      homeHeading: "Vil dere heller slippe å velge retter?",
      homeTeaser:
        "Kokkeløren sender én fast meny med tre middager i uken, satt sammen av kokken. Det passer for dere som ikke vil bruke tid på menyen, men kassen er dyrere i pakkene vi kan sammenligne og kan ikke tilpasses allergier eller vegetarkost.",
    },
  },
];
// Core providers only: main comparison, selector and /go/.
export const providers = catalog.filter(
  (p): p is Provider => p.tier === "core",
);
export const editorialProviders = catalog.filter(
  (p): p is Provider<EditorialProviderId> & { editorial: EditorialProfile } =>
    p.tier === "editorial" && !!p.editorial,
);
export const allProviders: Provider<ProviderSlug>[] = [
  ...providers,
  ...editorialProviders,
];
export const getProvider = (id: string) => providers.find((p) => p.id === id);
export const getEditorialProvider = (id: string) =>
  editorialProviders.find((p) => p.id === id);
export function isFresh(
  checkedAt: string,
  days: number,
  now = new Date(),
): boolean {
  const age = now.getTime() - Date.parse(checkedAt + "T00:00:00Z");
  return Number.isFinite(age) && age >= -86400000 && age <= days * 86400000;
}
export function readFact<T>(f: Fact<T>, now = new Date()): T | null {
  return isFresh(f.source.checkedAt, f.reviewAfterDays, now) ? f.value : null;
}
export function readOptional<T>(
  f: Fact<T> | undefined,
  now = new Date(),
): T | null {
  return f ? readFact(f, now) : null;
}
export function getQuote(
  p: Provider<ProviderSlug>,
  people: number,
  meals: number,
  now = new Date(),
) {
  return (
    p.quotes.find(
      (q) =>
        q.people === people &&
        q.meals === meals &&
        isFresh(q.source.checkedAt, q.reviewAfterDays, now) &&
        isFresh(q.deliverySource.checkedAt, q.reviewAfterDays, now),
    ) ?? null
  );
}
export function activeOffer(
  offer: Offer | null,
  now = new Date(),
): Offer | null {
  if (
    !offer ||
    !Number.isFinite(Date.parse(offer.validFrom)) ||
    !Number.isFinite(Date.parse(offer.validUntil)) ||
    now < new Date(offer.validFrom) ||
    now >= new Date(offer.validUntil) ||
    !isFresh(offer.lastChecked, offer.reviewAfterDays, now)
  )
    return null;
  return offer;
}
export const formatPrice = (amount: number) =>
  new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 0 }).format(amount) +
  " kr";
export const formatServing = (amount: number) =>
  new Intl.NumberFormat("nb-NO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + " kr";
export const formatDate = (d: string) => d.split("-").reverse().join(".");
const numberWords = [
  "null",
  "én",
  "to",
  "tre",
  "fire",
  "fem",
  "seks",
  "sju",
  "åtte",
  "ni",
  "ti",
];
// Small numbers as words in running text.
export const numberWord = (n: number) => numberWords[n] ?? String(n);
export const listJoin = (items: string[], last = "og") =>
  items.length > 1
    ? `${items.slice(0, -1).join(", ")} ${last} ${items[items.length - 1]}`
    : items.join("");
// Fresh totals with delivery for the sizes both core providers offer.
export function priceTally(
  a: Provider<ProviderSlug>,
  b: Provider<ProviderSlug>,
  now = new Date(),
) {
  let aWins = 0,
    bWins = 0,
    ties = 0,
    checkedAt = "";
  for (const q of a.quotes) {
    const qa = getQuote(a, q.people, q.meals, now),
      qb = getQuote(b, q.people, q.meals, now);
    if (!qa || !qb || qa.deliveryFee === null || qb.deliveryFee === null)
      continue;
    const ta = qa.boxPrice + qa.deliveryFee,
      tb = qb.boxPrice + qb.deliveryFee;
    if (ta < tb) aWins++;
    else if (tb < ta) bWins++;
    else ties++;
    checkedAt = qa.source.checkedAt;
  }
  return { aWins, bWins, ties, total: aWins + bWins + ties, checkedAt };
}
// Delivery samples follow the same 30-day freshness as prices.
export function freshDeliverySamples(
  p: Provider<ProviderSlug>,
  now = new Date(),
): DeliverySample[] {
  return (p.deliverySamples ?? []).filter((s) =>
    isFresh(s.source.checkedAt, 30, now),
  );
}
export function providerSources(p: Provider<ProviderSlug>): Source[] {
  const all = [
    ...p.sources,
    p.people.source,
    p.meals.source,
    p.selection.source,
    p.selectionCount.source,
    p.quick.source,
    p.vegetarian.source,
    p.flexibility.source,
    p.delivery.source,
    ...(p.coverage ? [p.coverage.source] : []),
    ...(p.deliveryWindows ? [p.deliveryWindows.source] : []),
    ...p.quotes.flatMap((q) => [q.source, q.deliverySource]),
  ];
  return [...new Map(all.map((s) => [s.url, s])).values()];
}
