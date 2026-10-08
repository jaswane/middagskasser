import type { ProviderSlug, Source } from "./data.ts";
// Editorial market overview (/matkasser). Every entry is a service we have
// checked against its own website. Commercial relationships are recorded for
// transparency and maintenance only: they never decide inclusion or order.
export type KitType = "ravarekasse" | "ferdigmat" | "trening" | "annet";
export const kitTypeLabels: Record<KitType, string> = {
  ravarekasse: "Råvarekasser med oppskrift",
  ferdigmat: "Ferdige middager",
  trening: "Trenings- og makrofokus",
  annet: "Annet",
};
export type MarketEntry = {
  id: string;
  name: string;
  url: string;
  type: KitType;
  // Short, sourced summaries in our own words.
  fitFor: string;
  difference: string;
  limitation: string;
  // Only for entries without a provider profile; profiles read live data.
  facts?: string;
  checkedAt: string;
  sources: Source[];
  commercial: "affiliate" | "none" | "unknown";
  // Provider with a full profile page on this site.
  profile?: ProviderSlug;
  // Råvarekasser only: whether customers pick dishes or get a fixed menu.
  menu?: "choose" | "fixed";
};
const s = (url: string, title: string, checkedAt: string): Source => ({
  url,
  title,
  checkedAt,
});
export const market: MarketEntry[] = [
  {
    id: "godtlevert",
    name: "Godtlevert",
    url: "https://www.godtlevert.no/",
    type: "ravarekasse",
    fitFor:
      "Husholdninger som trenger tre, fem eller seks porsjoner, eller vil ha mange retter å velge mellom.",
    difference:
      "Dere velger rettene selv, og kassen finnes i flere størrelser enn hos HelloFresh og Kokkeløren.",
    limitation:
      "Frakten for adressen vises først når dere har laget konto, og enkelte retter koster ekstra.",
    checkedAt: "2026-09-28",
    sources: [
      s(
        "https://www.godtlevert.no/velg-matkasse",
        "Godtlevert – pris og kassestørrelser",
        "2026-09-28",
      ),
      s(
        "https://www.godtlevert.no/vilkar",
        "Godtlevert – vilkår",
        "2026-09-28",
      ),
      s(
        "https://tips.godtlevert.no/nb/articles/16068043-avgifter-og-prisjusteringer",
        "Godtlevert – avgifter og prisjusteringer",
        "2026-09-28",
      ),
    ],
    commercial: "affiliate",
    profile: "godtlevert",
    menu: "choose",
  },
  {
    id: "hellofresh",
    name: "HelloFresh",
    url: "https://www.hellofresh.no/",
    type: "ravarekasse",
    fitFor:
      "To eller fire personer som vil velge middagene selv fra en ukemeny.",
    difference: "Dere velger rettene selv fra en meny som skifter hver uke.",
    limitation: "Bare to eller fire porsjoner per middag.",
    checkedAt: "2026-09-28",
    sources: [
      s(
        "https://www.hellofresh.no/plans",
        "HelloFresh – planvalg, postnummer 0150",
        "2026-09-28",
      ),
    ],
    commercial: "affiliate",
    profile: "hellofresh",
    menu: "choose",
  },
  {
    id: "kokkeloren",
    name: "Kokkeløren",
    url: "https://kokkeloren.no/",
    type: "ravarekasse",
    fitFor:
      "To eller fire voksne som spiser det meste og ikke vil bruke tid på å velge retter.",
    difference:
      "Én fast meny med tre middager i uken, satt sammen av kokken. Dere velger ingen retter.",
    limitation:
      "Rettene kan ikke byttes, og kassen tilpasses ikke allergier eller vegetarkost.",
    checkedAt: "2026-10-08",
    sources: [
      s(
        "https://kokkeloren.no/faq",
        "Kokkeløren – ofte stilte spørsmål",
        "2026-10-08",
      ),
    ],
    commercial: "none",
    profile: "kokkeloren",
    menu: "fixed",
  },
  {
    id: "godmatlyst",
    name: "God Matlyst",
    url: "https://www.godmatlyst.no/",
    type: "ferdigmat",
    facts:
      "5 eller 7 middager i uken, levert hver onsdag. 949 kr for 5 middager og 1 099 kr for 7, med frakt. Antall personer per leveranse er ikke oppgitt.",
    fitFor:
      "Eldre som bor hjemme og vil ha ferdige middager som bare skal varmes opp.",
    difference:
      "Ferdiglagde middager i stedet for råvarer og oppskrifter, uten bindingstid.",
    limitation: "Leverer i Oslo og omegn, og bare på onsdager.",
    checkedAt: "2026-10-08",
    sources: [
      s("https://www.godmatlyst.no/", "God Matlyst – forside", "2026-10-08"),
      s(
        "https://www.godmatlyst.no/vilkar",
        "God Matlyst – vilkår",
        "2026-10-08",
      ),
    ],
    commercial: "unknown",
  },
  {
    id: "fitme",
    name: "Fit Me",
    url: "https://fitme.no/",
    type: "trening",
    facts:
      "Enkeltmåltider fra 109 kr, i klassene Kalorismart, Sunn livsstil og Høy aktivitet. Levering fra 125 kr, eller henting i Bergen.",
    fitFor:
      "Dere som bor i Bergen og vil ha ferdige måltider med oppgitt kaloriinnhold.",
    difference:
      "Dere velger enkeltmåltider eller pakker etter kaloribehov, uten bindingstid.",
    limitation: "Leverer bare i Bergen. Leveransene til Oslo er stoppet.",
    checkedAt: "2026-10-08",
    sources: [
      s("https://fitme.no/", "Fit Me – forside", "2026-10-08"),
      s(
        "https://fitme.no/easy-faqs/",
        "Fit Me – spørsmål og svar",
        "2026-10-08",
      ),
    ],
    commercial: "unknown",
  },
  {
    id: "trenogmat",
    name: "Trenogmat",
    url: "https://trenogmat.no/",
    type: "trening",
    facts:
      "Vakuumerte, sjokkfryste ferdigmåltider i pakkene Vekttap, Prestasjon og Muskelbygging. Frakten koster fra 109 til 349 kr etter område.",
    fitFor:
      "Dere som trener og vil ha ferdige måltider tilpasset et mål, som vekttap eller muskelbygging.",
    difference:
      "Dere setter sammen pakken selv og kan bestille én gang, uten abonnement.",
    limitation:
      "Fast levering bare i utvalgte områder. Andre steder tar levering 1–4 dager. Vi fant ikke priser per måltid på meny- eller pakkesidene.",
    checkedAt: "2026-10-08",
    sources: [
      s("https://trenogmat.no/", "Trenogmat – forside", "2026-10-08"),
      s(
        "https://trenogmat.no/pages/delivery",
        "Trenogmat – levering",
        "2026-10-08",
      ),
      s("https://trenogmat.no/pages/terms", "Trenogmat – vilkår", "2026-10-08"),
    ],
    commercial: "unknown",
  },
];
// Recently closed services that people may still search for.
export const closed: { name: string; note: string; source: Source }[] = [
  {
    name: "Adams Matkasse",
    note: "stengte 11. mars 2026, og kundekontoene ble flyttet til Godtlevert",
    source: s(
      "https://www.adamsmatkasse.no/",
      "Adams Matkasse – melding om nedleggelse",
      "2026-10-08",
    ),
  },
];
// Within each type the order is alphabetical. It is not a recommendation.
export function marketByType(entries = market) {
  const order: KitType[] = ["ravarekasse", "ferdigmat", "trening", "annet"];
  return order
    .map((type) => ({
      type,
      entries: entries
        .filter((e) => e.type === type)
        .sort((a, b) => a.name.localeCompare(b.name, "nb")),
    }))
    .filter((g) => g.entries.length > 0);
}
