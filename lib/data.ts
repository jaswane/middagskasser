export type ProviderId = "godtlevert" | "hellofresh";
export type Source = { url: string; title: string; checkedAt: string };
export type Fact<T> = {
  value: T | null;
  source: Source;
  reviewAfterDays: number;
  note?: string;
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
export type Provider = {
  id: ProviderId;
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
  quotes: Quote[];
  offer: Offer | null;
  strengths: string[];
  limitations: string[];
  sources: Source[];
};
const date = "2026-09-28";
const source = (url: string, title: string): Source => ({
  url,
  title,
  checkedAt: date,
});
const gs = source("https://www.godtlevert.no/", "Godtlevert – egen nettside");
const hs = source("https://www.hellofresh.no/", "HelloFresh – egen nettside");
const gp = source(
  "https://www.godtlevert.no/velg-matkasse",
  "Godtlevert – pris og kassestørrelser",
);
const hp = source(
  "https://www.hellofresh.no/plans",
  "HelloFresh – planvalg, postnummer 0150",
);
const gf = source(
  "https://tips.godtlevert.no/nb/articles/16068043-avgifter-og-prisjusteringer",
  "Godtlevert – oppgitt standardfrakt",
);
const gt = source("https://www.godtlevert.no/vilkar", "Godtlevert – vilkår");
const ht = source(
  "https://www.hellofresh.no/about/termsandconditions",
  "HelloFresh – vilkår",
);
function fact<T>(value: T | null, source: Source, note?: string): Fact<T> {
  return { value, source, reviewAfterDays: 90, note };
}
function quotes(id: ProviderId, prices: number[][]): Quote[] {
  return prices.flatMap((values, i) =>
    values.map((boxPrice, j) => ({
      people: i === 0 ? 2 : 4,
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
export const providers: Provider[] = [
  {
    id: "godtlevert",
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
        gs,
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
    quotes: quotes("godtlevert", [
      [690, 860, 1020, 1190],
      [910, 1090, 1270, 1410],
    ]),
    offer: null,
    strengths: [
      "Dokumenterte porsjonsvalg fra 2 til 6.",
      "Oppgir flere retter å velge mellom enn HelloFresh.",
    ],
    limitations: [
      "Standardeksemplet inkluderer oppgitt frakt; adressepris er ikke bekreftet.",
      "Flere retter betyr ikke nødvendigvis flere retter som passer dere.",
    ],
    sources: [gs, gp, gf, gt],
  },
  {
    id: "hellofresh",
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
        hs,
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
    quotes: quotes("hellofresh", [
      [660, 770, 960, 1150],
      [890, 1060, 1270, 1440],
    ]),
    offer: null,
    strengths: [
      "Lavere standardpris i flere av de kontrollerte pakkestørrelsene.",
      "Du velger retter og kan hoppe over uker.",
    ],
    limitations: [
      "Planvalget viste bare 2 eller 4 porsjoner.",
      "Fraktprisen er kontrollert for postnummer 0150, ikke alle adresser.",
    ],
    sources: [hs, hp, ht],
  },
];
export const getProvider = (id: string) => providers.find((p) => p.id === id);
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
export function getQuote(
  p: Provider,
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
export function providerSources(p: Provider): Source[] {
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
    ...p.quotes.flatMap((q) => [q.source, q.deliverySource]),
  ];
  return [...new Map(all.map((s) => [s.url, s])).values()];
}
