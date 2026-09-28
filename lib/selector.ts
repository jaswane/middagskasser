import {
  getQuote,
  readFact,
  formatPrice,
  type Provider,
  type Quote,
} from "./data.ts";
export type Answers = {
  people: number;
  meals: number;
  priority: "price" | "selection" | "none";
};
export type Match = {
  provider: Provider;
  compatible: boolean | null;
  score: number;
  reasons: string[];
  unknown: string[];
  priceQuote: Quote | null;
};
export function matchProviders(
  providers: Provider[],
  answers: Answers,
  now = new Date(),
): Match[] {
  const quotes = providers.map((p) =>
    getQuote(p, answers.people, answers.meals, now),
  );
  const comparable =
    quotes.length > 1 &&
    quotes.every((q) => q !== null && q.deliveryFee !== null);
  const totals = comparable
    ? quotes.map((q) => q!.boxPrice + q!.deliveryFee!)
    : [];
  const counts = providers.map((p) => readFact(p.selectionCount, now));
  return providers.map((provider, index) => {
    const people = readFact(provider.people, now),
      meals = readFact(provider.meals, now);
    const excluded =
      (people !== null && !people.includes(answers.people)) ||
      (meals !== null && !meals.includes(answers.meals));
    const compatible = excluded
      ? false
      : people === null || meals === null
        ? null
        : true;
    const reasons: string[] = [],
      unknown: string[] = [];
    let score = 0;
    let priceQuote: Quote | null = null;
    if (compatible === true)
      reasons.push(
        `${answers.people} porsjoner og ${answers.meals} middager er en dokumentert kombinasjon.`,
      );
    if (compatible === false)
      reasons.push(
        "Valget ligger utenfor de dokumenterte porsjons- eller middagsstørrelsene.",
      );
    if (compatible === null)
      unknown.push("Vi mangler fersk bekreftelse på denne kassestørrelsen.");
    if (compatible === true && answers.priority === "price") {
      if (comparable) {
        priceQuote = quotes[index];
        const min = Math.min(...totals),
          max = Math.max(...totals),
          total = totals[index];
        reasons.push(
          `${formatPrice(total)} per uke i standardeksemplet, inkludert oppgitt frakt.`,
        );
        if (total === min && min < max) {
          score = 1;
          reasons.push(
            `${formatPrice(max - min)} lavere enn alternativet i dette eksemplet.`,
          );
        } else if (min === max)
          reasons.push("De to standardeksemplene har lik pris.");
        unknown.push(
          "HelloFresh er kontrollert for 0150. Godtlevert er beregnet med standardfrakt. Bekreft pris for din adresse.",
        );
      } else
        unknown.push(
          "Vi mangler to ferske totalpriser for samme pakke. Derfor får pris ingen utslagskraft.",
        );
    }
    if (compatible === true && answers.priority === "selection") {
      if (counts.every((n) => n !== null)) {
        const n = counts[index]!;
        reasons.push(
          `Leverandøren oppgir ${n} retter per uke. Vi har ikke telt unike retter selv.`,
        );
        if (n > Math.min(...(counts as number[]))) {
          score = 1;
          reasons.push(
            "Det er flere oppgitte valgmuligheter enn hos alternativet.",
          );
        }
        unknown.push(
          "Eldre leverandørsider oppgir andre tall. Flere valg sier ikke noe sikkert om smak eller kvalitet.",
        );
      } else
        unknown.push(
          "Oppgitt utvalg må kontrolleres igjen. Ingen preferansepoeng deles ut.",
        );
    }
    if (
      compatible === true &&
      answers.priority === "none" &&
      providers.every(
        (p) =>
          readFact(p.quick, now) &&
          readFact(p.vegetarian, now) &&
          readFact(p.flexibility, now),
      )
    )
      reasons.push(
        "Begge har vegetariske og raske alternativer og kan pauses før fristen. Se på ukens retter.",
      );
    return { provider, compatible, score, reasons, unknown, priceQuote };
  });
}
export function resultTitle(matches: Match[], answers: Answers) {
  const valid = matches.filter((m) => m.compatible === true),
    unknown = matches.filter((m) => m.compatible === null);
  if (!valid.length)
    return unknown.length
      ? "Vi trenger ferskere data for å gi et svar"
      : "Ingen dokumentert match for denne størrelsen";
  if (valid.length === 1)
    return `${valid[0].provider.name} har den valgte kassestørrelsen`;
  const preferred = valid.find((m) => m.score > 0);
  if (preferred)
    return answers.priority === "price"
      ? `${preferred.provider.name} har lavere pris i dette eksemplet`
      : `${preferred.provider.name} oppgir flere valgmuligheter`;
  if (
    answers.priority === "price" &&
    valid.some((m) => m.unknown.some((s) => s.startsWith("Vi mangler")))
  )
    return "Vi kan ikke sammenligne prisen ennå";
  return "Begge kan være aktuelle for dere";
}
