import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageIntro } from "./chrome";
import { DirectOutbound } from "./outbound";
import { coverageSentence } from "@/lib/coverage";
import {
  providers,
  readFact,
  readOptional,
  getQuote,
  formatDate,
  formatPrice,
  formatServing,
  providerSources,
  type EditorialProfile,
  type EditorialProviderId,
  type Provider,
  type ProviderSlug,
} from "@/lib/data";
type EditorialProvider = Provider<EditorialProviderId> & {
  editorial: EditorialProfile;
};
const total = (p: Provider<ProviderSlug>, people: number, meals: number) => {
  const q = getQuote(p, people, meals);
  return q && q.deliveryFee !== null ? q.boxPrice + q.deliveryFee : null;
};
// A provider page for providers outside the core comparison: same facts and
// freshness rules, a plain outbound link and no ad labelling.
export function EditorialProviderPage({
  provider: p,
}: {
  provider: EditorialProvider;
}) {
  const e = p.editorial;
  const sizes = readFact(p.people);
  const meals = readFact(p.meals);
  const prices = (p.quotes ?? [])
    .map((q) => getQuote(p, q.people, q.meals))
    .filter((q) => q !== null);
  // Only package sizes every core provider also offers can be compared.
  const shared = prices.filter((q) =>
    providers.every((c) => total(c, q.people, q.meals) !== null),
  );
  const coreChecked = shared.length
    ? getQuote(providers[0], shared[0].people, shared[0].meals)!.source
        .checkedAt
    : "";
  return (
    <div className="container page-content">
      <PageIntro
        eyebrow="LEVERANDØREN KORT FORTALT"
        title={`${p.name} matkasse`}
      >
        <p>{e.summary}</p>
      </PageIntro>
      <div className="content-grid">
        <div className="prose">
          <h2>Hva koster {p.name}?</h2>
          {prices.length ? (
            <>
              <ul>
                {prices.map((q) => (
                  <li key={q.people}>
                    {q.people} voksne og {q.meals} middager:{" "}
                    {formatPrice(q.boxPrice)} for kassen og{" "}
                    {formatPrice(q.deliveryFee!)} for hjemlevering, til sammen{" "}
                    <strong>{formatPrice(q.boxPrice + q.deliveryFee!)}</strong>{" "}
                    i uken. Det blir{" "}
                    {formatServing(
                      (q.boxPrice + q.deliveryFee!) / (q.people * q.meals),
                    )}{" "}
                    per porsjon.
                  </li>
                ))}
              </ul>
              <p className="neutral-note">
                {prices[0].addressNote} Ordinær pris uten introtilbud. Vi så
                ikke noe introtilbud ved kontrollen{" "}
                {formatDate(prices[0].source.checkedAt)}.
              </p>
              <p>
                Priser for alle størrelser hos de tre matkassene:{" "}
                <Link href="/billigste-matkasse">Billigste matkasse</Link>.
              </p>
            </>
          ) : (
            <p>
              Prisen må kontrolleres på nytt. Se gjeldende pris hos {p.name} før
              dere bestiller.
            </p>
          )}
          <h2>Hva dere får og velger</h2>
          <p>{e.difference}</p>
          {sizes && meals && (
            <p>
              Kassen har alltid {meals.join(" eller ")} middager og finnes for{" "}
              {sizes.join(" eller ")} voksne. {p.people.note}
            </p>
          )}
          {p.quick.note && <p>{p.quick.note}</p>}
          <p>
            {readFact(p.selection) ?? "Må kontrolleres."}{" "}
            {readFact(p.vegetarian)}
          </p>
          <h2>Hvor og når {p.name} leverer</h2>
          <p>
            {readOptional(p.coverage)} {readOptional(p.deliveryWindows)} Om dere
            får levert, ser dere når dere skriver inn postnummeret hos {p.name}.
          </p>
          {coverageSentence(p) && (
            <p>
              {coverageSentence(p)}{" "}
              <Link href="/levering">Se svarene for hvert postnummer</Link>.
            </p>
          )}
          <h2>Pause og avbestilling</h2>
          <p>{readFact(p.flexibility)}</p>
          <h2>Hvem passer {p.name} for?</h2>
          <p>{e.fitFor}</p>
          <p>
            <strong>Derfor kan dere velge {p.name}:</strong> {e.strength}
          </p>
          <h2>Viktigste begrensning</h2>
          <p>{e.limitation}</p>
          <h2>Når HelloFresh eller Godtlevert passer bedre</h2>
          <p>
            {e.alternative}{" "}
            <Link href="/beste-matkasse">
              Se hvilken matkasse som peker seg ut for ulike behov
            </Link>
            .
          </p>
          <ul>
            <li>
              Valg av retter: {p.name} har én fast meny.{" "}
              {providers
                .map((c) => {
                  const n = readFact(c.selectionCount);
                  return n ? `${c.name} oppgir ${n}` : null;
                })
                .filter(Boolean)
                .join(" og ")}{" "}
              retter å velge fra.
            </li>
            {shared.map((q) => (
              <li key={q.people}>
                {q.people} porsjoner og {q.meals} middager, med frakt: {p.name}{" "}
                {formatPrice(q.boxPrice + q.deliveryFee!)},{" "}
                {providers
                  .map(
                    (c) =>
                      `${c.name} ${formatPrice(total(c, q.people, q.meals)!)}`,
                  )
                  .join(" og ")}
                .
              </li>
            ))}
            <li>
              Middager per uke: {p.name} {meals?.join(", ") ?? "ukjent"},{" "}
              {providers
                .map((c) => {
                  const m = readFact(c.meals);
                  return `${c.name} ${m ? `${m[0]}–${m[m.length - 1]}` : "ukjent"}`;
                })
                .join(" og ")}
              .
            </li>
          </ul>
          {shared.length > 0 && (
            <p className="neutral-note">
              {coreChecked === shared[0].source.checkedAt
                ? `Alle prisene ble kontrollert ${formatDate(coreChecked)}.`
                : `Prisene for ${providers.map((c) => c.name).join(" og ")} ble kontrollert ${formatDate(coreChecked)}, og prisene for ${p.name} ${formatDate(shared[0].source.checkedAt)}.`}{" "}
              Alle gjelder ordinær pris med oppgitt frakt. Vi regner {p.name}s
              kasse for to eller fire voksne som to eller fire porsjoner.
            </p>
          )}
          <Link className="text-link" href="/hellofresh-vs-godtlevert">
            Se HelloFresh og Godtlevert side om side <ArrowRight size={15} />
          </Link>
          <p>
            Lenken under går rett til {p.name}. Den er ikke en annonselenke, og
            vi får ikke provisjon om dere bestiller.
          </p>
          <DirectOutbound id={p.id} url={p.websiteUrl} />
          <h2>Kilder og sist kontrollert</h2>
          <ul className="source-list">
            {providerSources(p).map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.title}
                </a>
                <br />
                Kontrollert {formatDate(s.checkedAt)}
              </li>
            ))}
          </ul>
          <p>
            Vi har ikke testet eller smakt maten. Beskrivelsen bygger på{" "}
            {p.name}s egne opplysninger og priser vi så i bestillingen.{" "}
            <Link href="/slik-sammenligner-vi">Slik sammenligner vi</Link>.
          </p>
        </div>
        <aside className="fact-panel">
          <h3>{p.name} i korte trekk</h3>
          <dl>
            <div>
              <dt>Kassestørrelser</dt>
              <dd>
                {sizes ? `${sizes.join(" eller ")} voksne` : "Må kontrolleres"}
              </dd>
            </div>
            <div>
              <dt>Middager per uke</dt>
              <dd>{meals?.join(", ") ?? "Må kontrolleres"}</dd>
            </div>
            <div>
              <dt>Valg av retter</dt>
              <dd>{readFact(p.selection) ?? "Må kontrolleres"}</dd>
            </div>
            <div>
              <dt>Binding</dt>
              <dd>
                {readFact(p.flexibility) ? "Ingen binding" : "Må kontrolleres"}
              </dd>
            </div>
            <div>
              <dt>Levering</dt>
              <dd>Sjekk postnummer</dd>
            </div>
          </dl>
          <p>
            <Link className="text-link" href="/hellofresh">
              Les om HelloFresh <ArrowRight size={15} />
            </Link>
          </p>
          <p>
            <Link className="text-link" href="/godtlevert">
              Les om Godtlevert <ArrowRight size={15} />
            </Link>
          </p>
        </aside>
      </div>
    </div>
  );
}
