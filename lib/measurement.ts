export const CONSENT_KEY = "middagskasser-statistikk";
export const CONSENT_DAYS = 180;
export const METHOD_VERSION = "2026-09-28";
export type Consent = { version: 1; choice: "yes" | "no"; expires: number };
export function consentValue(
  raw: string | null,
  now = Date.now(),
): Consent | null {
  try {
    const value = JSON.parse(raw || "null");
    return value?.version === 1 &&
      ["yes", "no"].includes(value.choice) &&
      Number.isFinite(value.expires) &&
      value.expires > now &&
      value.expires <= now + CONSENT_DAYS * 86400000
      ? value
      : null;
  } catch {
    return null;
  }
}
export function newConsent(choice: "yes" | "no", now = Date.now()): Consent {
  return { version: 1, choice, expires: now + CONSENT_DAYS * 86400000 };
}
export function validGaId(value: string | undefined): value is string {
  return /^G-[A-Z0-9]{6,20}$/.test(value || "");
}
export const paths = [
  "/",
  "/finn-matkasse",
  "/hellofresh",
  "/godtlevert",
  "/hellofresh-vs-godtlevert",
  "/slik-sammenligner-vi",
  "/om",
  "/kontakt",
  "/personvern",
  "/annonselenker",
  "/kokkeloren",
  "/matkasser",
  "/beste-matkasse",
  "/billigste-matkasse",
  "/levering",
];
export function measuredPath(path: string) {
  return paths.includes(path) ? path : "/404";
}
// Core providers can have affiliate links and selector results. Editorial
// providers only have a provider page and a plain outbound link.
const coreProviders = ["hellofresh", "godtlevert"];
export const pageProviders = [...coreProviders, "kokkeloren"];
const placements = ["comparison", "selector_result", "provider_bottom"];
const rules = {
  page_view: { page_path: [...paths, "/404"] },
  selector_start: { placement: ["selector_page"], page: ["/finn-matkasse"] },
  selector_answer: {
    step: ["people", "meals", "priority"],
    answer_id: ["2", "3", "4", "5", "6", "7", "price", "selection", "none"],
  },
  selector_complete: {
    result_type: [...coreProviders, "shared_or_uncertain", "no_match"],
    method_version: [METHOD_VERSION],
  },
  comparison_view: { page: paths, placement: ["comparison"] },
  comparison_expand: {
    page: paths,
    section: ["details_open", "details_closed"],
  },
  provider_view: {
    provider: pageProviders,
    page: pageProviders.map((id) => "/" + id),
  },
  affiliate_click: {
    provider: coreProviders,
    placement: placements,
    page: paths,
    offer_type: ["none"],
  },
  provider_outbound: {
    provider: pageProviders,
    placement: placements,
    page: paths,
    offer_type: ["none"],
  },
  sibling_site_click: {
    placement: ["sibling_section"],
    page: paths,
    direction: ["middagskasser_to_middagen"],
  },
} satisfies Record<string, Record<string, string[]>>;
export type MeasurementEvent = keyof typeof rules;
// Only documented, coarse values may leave the browser. Unknown fields are discarded.
export function eventParams(
  event: string,
  params: Record<string, string | number>,
) {
  if (!Object.hasOwn(rules, event)) return null;
  const rule = rules[event as MeasurementEvent] as Record<string, string[]>;
  const clean: Record<string, string> = {};
  for (const [key, allowed] of Object.entries(rule)) {
    const value = String(params[key] ?? "");
    if (!allowed.includes(value)) return null;
    clean[key] = value;
  }
  if (event === "selector_answer") {
    const options =
      clean.step === "people"
        ? ["2", "3", "4", "5", "6", "7"]
        : clean.step === "meals"
          ? ["2", "3", "4", "5"]
          : ["price", "selection", "none"];
    if (!options.includes(clean.answer_id)) return null;
  }
  return clean;
}
export function consentCommands(id: string, pageLocation: string): unknown[][] {
  return [
    [
      "consent",
      "default",
      {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      },
    ],
    ["consent", "update", { analytics_storage: "granted" }],
    ["js", new Date()],
    [
      "config",
      id,
      {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: pageLocation,
        page_referrer: "",
        cookie_expires: CONSENT_DAYS * 86400,
        cookie_update: false,
      },
    ],
  ];
}
