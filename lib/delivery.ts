import type { ProviderSlug, Source } from "./data.ts";
// Delivery checks for a fixed sample of postcodes, read by hand in each
// provider's own public delivery checker. One postcode stands for that
// postcode only, never for the whole municipality.
//
// New check round: update `checkedAt` and the rows below. Rows older than
// `reviewAfterDays` are hidden on the site until they are checked again.
export type Region =
  "Østlandet" | "Sørlandet" | "Vestlandet" | "Trøndelag" | "Nord-Norge";
export const regions: Region[] = [
  "Østlandet",
  "Sørlandet",
  "Vestlandet",
  "Trøndelag",
  "Nord-Norge",
];
export type Place = { postcode: string; place: string; region: Region };
export const places: Place[] = [
  { postcode: "0150", place: "Oslo", region: "Østlandet" },
  { postcode: "3015", place: "Drammen", region: "Østlandet" },
  { postcode: "1606", place: "Fredrikstad", region: "Østlandet" },
  { postcode: "2317", place: "Hamar", region: "Østlandet" },
  { postcode: "2609", place: "Lillehammer", region: "Østlandet" },
  { postcode: "2815", place: "Gjøvik", region: "Østlandet" },
  { postcode: "4611", place: "Kristiansand", region: "Sørlandet" },
  { postcode: "4836", place: "Arendal", region: "Sørlandet" },
  { postcode: "5003", place: "Bergen", region: "Vestlandet" },
  { postcode: "4006", place: "Stavanger", region: "Vestlandet" },
  { postcode: "5527", place: "Haugesund", region: "Vestlandet" },
  { postcode: "6800", place: "Førde", region: "Vestlandet" },
  { postcode: "6002", place: "Ålesund", region: "Vestlandet" },
  { postcode: "6413", place: "Molde", region: "Vestlandet" },
  { postcode: "7010", place: "Trondheim", region: "Trøndelag" },
  { postcode: "7340", place: "Oppdal", region: "Trøndelag" },
  { postcode: "7374", place: "Røros", region: "Trøndelag" },
  { postcode: "8006", place: "Bodø", region: "Nord-Norge" },
  { postcode: "8657", place: "Mosjøen", region: "Nord-Norge" },
  { postcode: "8622", place: "Mo i Rana", region: "Nord-Norge" },
  { postcode: "9008", place: "Tromsø", region: "Nord-Norge" },
  { postcode: "9510", place: "Alta", region: "Nord-Norge" },
  { postcode: "9900", place: "Kirkenes", region: "Nord-Norge" },
];
export type DeliveryStatus =
  | "delivers"
  | "no-delivery"
  // The checker asked for a full address instead of answering.
  | "address-required"
  | "not-public";
export const weekdays = [
  "man",
  "tir",
  "ons",
  "tor",
  "fre",
  "lør",
  "søn",
] as const;
export type Weekday = (typeof weekdays)[number];
export type DeliveryDay = { day: Weekday; windows: string[] };
export type FeeBasis =
  | "observed"
  | "stated-standard"
  | "not-shown"
  // Shown by the provider, but not read for this postcode.
  | "not-checked";
export type DeliveryCheck = {
  provider: ProviderSlug;
  postcode: string;
  status: DeliveryStatus;
  // null: the provider does not show days for a postcode without an account.
  days: DeliveryDay[] | null;
  fee: number | null;
  feeBasis: FeeBasis;
  feeSource?: Source;
  source: Source;
  reviewAfterDays: number;
  note?: string;
};
const checkedAt = "2026-10-08";
const src = (url: string, title: string): Source => ({
  url,
  title,
  checkedAt,
});
// The public checkers people can use themselves.
export const checkers: Record<ProviderSlug, Source> = {
  hellofresh: src(
    "https://www.hellofresh.no/plans",
    "HelloFresh – postnummersjekk i planvalget",
  ),
  godtlevert: src(
    "https://www.godtlevert.no/hvor-leverer-godtlevert",
    "Godtlevert – hvor leverer Godtlevert",
  ),
  kokkeloren: src(
    "https://kokkeloren.no/sjekk-levering",
    "Kokkeløren – sjekk levering",
  ),
};
const kokkelorenOrder = src(
  "https://kokkeloren.no/kasse/abonnement/matkasse",
  "Kokkeløren – leveringssteget i bestillingen",
);
const godtlevertFee = src(
  "https://tips.godtlevert.no/nb/articles/16068043-avgifter-og-prisjusteringer",
  "Godtlevert – oppgitt standardfrakt",
);
// "lør 09–18; søn 09–18, 14–20" → days in week order.
function parseDays(text: string): DeliveryDay[] {
  return text
    .split(";")
    .map((part) => {
      const [day, ...rest] = part.trim().split(" ");
      return {
        day: day as Weekday,
        windows: rest
          .join(" ")
          .split(",")
          .map((w) => w.trim().replace("-", "–")),
      };
    })
    .sort((a, b) => weekdays.indexOf(a.day) - weekdays.indexOf(b.day));
}
// "N" = no delivery, "A" = full address required, "J" = delivers without
// public days, otherwise the days and windows the checker showed.
type Row = Record<string, string>;
const hellofresh: Row = {
  "0150": "J",
  "3015": "J",
  "1606": "J",
  "2317": "J",
  "2609": "J",
  "2815": "J",
  "4611": "J",
  "4836": "J",
  "5003": "J",
  "4006": "J",
  "5527": "J",
  "6800": "N",
  "6002": "J",
  "6413": "J",
  "7010": "J",
  "7340": "N",
  "7374": "N",
  "8006": "J",
  "8657": "N",
  "8622": "N",
  "9008": "J",
  "9510": "N",
  "9900": "N",
};
// HelloFresh postcodes where the 79 kr fee was read in the plan summary.
const hellofreshFeeRead = [
  "0150",
  "5003",
  "7010",
  "4006",
  "8006",
  "4611",
  "9008",
  "6002",
  "2609",
  "5527",
  "6413",
];
const godtlevert: Row = {
  "0150": "lør 09-18; søn 09-18, 14-20; man 09-15, 16-22",
  "3015": "lør 09-18; søn 10-16, 14-20; man 09-15, 16-22",
  "1606": "søn 09-18, 14-20; man 16-22",
  "2317": "lør 09-18; man 16-22",
  "2609": "lør 09-18; man 16-22",
  "2815": "lør 09-18; man 16-22",
  "4611": "søn 14-20; man 16-22",
  "4836": "søn 14-20; man 16-22",
  "5003": "lør 10-16; søn 10-16, 15-21; man 09-15, 16-22",
  "4006": "søn 10-16, 14-20; man 09-15, 16-22",
  "5527": "man 16-22",
  "6800": "A",
  "6002": "man 09-15, 16-22",
  "6413": "man 16-22",
  "7010": "lør 10-16; søn 10-16, 14-20; man 09-15, 16-22",
  "7340": "lør 09-18",
  "7374": "A",
  "8006": "søn 14-20; man 09-15, 16-22",
  "8657": "A",
  "8622": "man 16-22",
  "9008": "søn 14-20; man 09-15, 16-22",
  "9510": "man 16-22",
  "9900": "N",
};
const kokkeloren: Row = {
  "0150":
    "fre 12-18, 16-22; lør 09-16, 12-18; søn 09-16, 12-18, 14-21; man 12-18, 16-22; tir 12-18, 16-22",
  "3015": "lør 09-16, 12-18; tir 12-18, 16-22",
  "1606": "søn 09-16, 12-18, 14-21; man 12-18, 16-22; tir 12-18, 16-22",
  "2317": "lør 09-18; søn 09-18; tir 14-22",
  "2609": "lør 09-18; søn 09-18; tir 14-22",
  "2815": "lør 09-18; søn 09-18; tir 14-22",
  "4611": "man 16-22; tir 16-22",
  "4836": "man 16-22; tir 16-22",
  "5003": "søn 10-17, 14-22; man 12-18, 14-22, 16-22",
  "4006": "lør 11-17; søn 14-20; man 16-22",
  "5527": "man 16-22",
  "6800": "N",
  "6002": "man 16-22",
  "6413": "man 16-22",
  "7010": "lør 09-18; søn 09-18, 12-18, 14-20; man 12-18, 14-22, 16-22",
  "7340": "N",
  "7374": "N",
  "8006": "søn 14-20; man 16-22",
  "8657": "man 16-22",
  "8622": "man 16-22",
  "9008": "man 16-22",
  "9510": "man 16-22",
  "9900": "N",
};
function status(code: string): DeliveryStatus {
  return code === "N"
    ? "no-delivery"
    : code === "A"
      ? "address-required"
      : "delivers";
}
const base = { reviewAfterDays: 120 };
export const deliveryChecks: DeliveryCheck[] = [
  ...Object.entries(hellofresh).map(([postcode, code]) => {
    const read = code === "J" && hellofreshFeeRead.includes(postcode);
    return {
      ...base,
      provider: "hellofresh" as const,
      postcode,
      status: status(code),
      days: null,
      fee: read ? 79 : null,
      feeBasis: (code !== "J"
        ? "not-shown"
        : read
          ? "observed"
          : "not-checked") as FeeBasis,
      feeSource: read ? checkers.hellofresh : undefined,
      source: checkers.hellofresh,
    };
  }),
  ...Object.entries(godtlevert).map(([postcode, code]) => {
    const s = status(code);
    return {
      ...base,
      provider: "godtlevert" as const,
      postcode,
      status: s,
      days: s === "delivers" ? parseDays(code) : null,
      fee: s === "delivers" ? 79 : null,
      feeBasis: (s === "delivers"
        ? "stated-standard"
        : "not-shown") as FeeBasis,
      feeSource: s === "delivers" ? godtlevertFee : undefined,
      source: checkers.godtlevert,
    };
  }),
  ...Object.entries(kokkeloren).map(([postcode, code]) => {
    const s = status(code);
    return {
      ...base,
      provider: "kokkeloren" as const,
      postcode,
      status: s,
      days: s === "delivers" ? parseDays(code) : null,
      fee: s === "delivers" ? 79 : null,
      feeBasis: (s === "delivers" ? "observed" : "not-shown") as FeeBasis,
      feeSource: s === "delivers" ? kokkelorenOrder : undefined,
      source: kokkelorenOrder,
      note: s === "delivers" ? "Hjemlevering var eneste valg." : undefined,
    };
  }),
];
// Place × provider pairs without a check, for the next round.
export function missingChecks(providers: ProviderSlug[]) {
  return places.flatMap((p) =>
    providers
      .filter(
        (id) =>
          !deliveryChecks.some(
            (c) => c.provider === id && c.postcode === p.postcode,
          ),
      )
      .map((id) => ({ provider: id, postcode: p.postcode })),
  );
}
// What each public checker shows, in our words.
export const checkerNotes: Record<ProviderSlug, string> = {
  hellofresh:
    "skriv postnummeret i planvalget. Svaret kommer med en gang, men leveringsdager og tidsvinduer ser dere først etter at dere har laget konto.",
  godtlevert:
    "leveringssjekken viser ukedager og tidsvinduer for postnummeret. Noen steder ber den om full adresse.",
  kokkeloren:
    "leveringssjekken viser ukedager og tidsvinduer for postnummeret.",
};
