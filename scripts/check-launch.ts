import nextEnv from "@next/env";
import { launchErrors } from "../lib/launch.ts";
import {
  providers,
  editorialProviders,
  readFact,
  getQuote,
} from "../lib/data.ts";
nextEnv.loadEnvConfig(process.cwd());
const errors = launchErrors(process.env);
for (const p of providers) {
  for (const field of [
    "people",
    "meals",
    "selection",
    "selectionCount",
    "quick",
    "vegetarian",
    "flexibility",
    "delivery",
  ] as const) {
    const fact = p[field];
    if (readFact({ ...fact, value: String(fact.value ?? "") }) === null)
      errors.push(`${p.id}: ${field} trenger ny kildekontroll.`);
  }
  for (const people of [2, 4])
    for (const meals of [2, 3, 4, 5])
      if (!getQuote(p, people, meals))
        errors.push(`${p.id}: pris ${people} x ${meals} må kontrolleres.`);
  // Other registered sizes, such as Godtlevert's 3, 5 and 6 portions.
  for (const q of p.quotes)
    if (q.people !== 2 && q.people !== 4 && !getQuote(p, q.people, q.meals))
      errors.push(`${p.id}: pris ${q.people} x ${q.meals} må kontrolleres.`);
}
// Editorial providers: every fact and price shown on their page must be fresh.
for (const p of editorialProviders) {
  for (const field of [
    "people",
    "meals",
    "selection",
    "selectionCount",
    "quick",
    "vegetarian",
    "flexibility",
    "delivery",
    "coverage",
    "deliveryWindows",
  ] as const) {
    const fact = p[field];
    if (fact && readFact({ ...fact, value: "" }) === null)
      errors.push(`${p.id}: ${field} trenger ny kildekontroll.`);
  }
  for (const q of p.quotes)
    if (!getQuote(p, q.people, q.meals))
      errors.push(`${p.id}: pris ${q.people} x ${q.meals} må kontrolleres.`);
}
if (process.env.NEXT_PUBLIC_INDEXABLE !== "true")
  errors.push("Indeksering er ikke slått på i produksjonsbygget.");
if (errors.length) {
  console.error("NO-GO\n" + errors.map((e) => `- ${e}`).join("\n"));
  process.exitCode = 1;
} else
  console.log(
    "GO for konfigurasjon og datoferskhet. Se signert lanseringsrapport for manuell QA.",
  );
