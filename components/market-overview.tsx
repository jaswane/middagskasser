import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageIntro } from "./chrome";
import { allProviders, readFact, formatDate } from "@/lib/data";
import {
  market,
  closed,
  marketByType,
  kitTypeLabels,
  type MarketEntry,
} from "@/lib/market";
// Portions and dinners for providers with a profile come from the provider
// data, so they follow the same freshness rules as the rest of the site.
function profileFacts(e: MarketEntry) {
  const p = allProviders.find((x) => x.id === e.profile);
  if (!p) return null;
  const people = readFact(p.people);
  const meals = readFact(p.meals);
  if (!people || !meals) return null;
  const range = (n: number[]) =>
    n.length > 1 ? `${n[0]}–${n[n.length - 1]}` : `${n[0]}`;
  return {
    text: `${people.length > 2 ? range(people) : people.join(" eller ")} porsjoner per middag, ${range(meals)} middager i uken.`,
    checkedAt: p.people.source.checkedAt,
  };
}
export function MarketOverview() {
  const profiles = market.filter((e) => e.profile).length;
  const raw = market
    .filter((e) => e.type === "ravarekasse")
    .sort((a, b) => a.name.localeCompare(b.name, "nb"));
  const words = [
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
  const num = (n: number) => words[n] ?? String(n);
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const list = (names: string[]) =>
    names.length > 1
      ? `${names.slice(0, -1).join(", ")} og ${names[names.length - 1]}`
      : names.join("");
  return (
    <div className="container page-content">
      <PageIntro eyebrow="MARKEDSOVERSIKT" title="Matkasser i Norge">
        <p>
          Vi har kontrollert {num(market.length)} tjenester som leverer middag
          hjem i Norge. {cap(num(raw.length))} av dem er matkasser med råvarer
          og oppskrift: {list(raw.map((e) => e.name))}. De andre leverer ferdige
          måltider. For hver tjeneste står hvem den passer for, den viktigste
          forskjellen og den viktigste begrensningen. De {num(profiles)}{" "}
          matkassene med lenke til profil har vi skrevet mer utfyllende om.
        </p>
      </PageIntro>
      <div className="prose">
        <p className="neutral-note">
          Rekkefølgen er alfabetisk innenfor hver type. Den er ikke en
          rangering, og annonseavtaler avgjør verken hvem som er med eller hvor
          de står.
        </p>
        {marketByType().map((group) => (
          <section key={group.type}>
            <h2>{kitTypeLabels[group.type]}</h2>
            {group.entries.map((e) => {
              const live = profileFacts(e);
              const facts = live?.text ?? e.facts;
              const checked = live?.checkedAt ?? e.checkedAt;
              return (
                <article key={e.id}>
                  <h3>{e.name}</h3>
                  {facts && <p>{facts}</p>}
                  <p>
                    <strong>Passer for:</strong> {e.fitFor}
                  </p>
                  <p>
                    <strong>Viktigste forskjell:</strong> {e.difference}
                  </p>
                  <p>
                    <strong>Viktigste begrensning:</strong> {e.limitation}
                  </p>
                  <p className="source-list">
                    Kontrollert {formatDate(checked)} mot{" "}
                    {e.sources.map((src, i) => (
                      <span key={src.url}>
                        {i > 0 && (i === e.sources.length - 1 ? " og " : ", ")}
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {src.title}
                        </a>
                      </span>
                    ))}
                    .
                  </p>
                  {e.profile ? (
                    <Link className="text-link" href={`/${e.profile}`}>
                      Les profilen av {e.name} <ArrowRight size={15} />
                    </Link>
                  ) : (
                    <a className="text-link" href={e.url}>
                      Til {new URL(e.url).hostname.replace(/^www\./, "")}
                    </a>
                  )}
                </article>
              );
            })}
          </section>
        ))}
        {closed.length > 0 && (
          <>
            <h2>Nedlagte matkasser</h2>
            {closed.map((c) => (
              <p key={c.name}>
                {c.name} {c.note}, ifølge{" "}
                <a href={c.source.url}>{c.name}s egen nettside</a> (kontrollert{" "}
                {formatDate(c.source.checkedAt)}).
              </p>
            ))}
          </>
        )}
        <h2>Vil dere sammenligne direkte?</h2>
        <p>
          HelloFresh og Godtlevert har flest felles kassestørrelser, så de kan
          sammenlignes side om side på pris, utvalg og vilkår.{" "}
          <Link href="/hellofresh-vs-godtlevert">Se sammenligningen</Link> eller{" "}
          <Link href="/finn-matkasse">bruk matkassevelgeren</Link>. Slik har vi
          kontrollert opplysningene:{" "}
          <Link href="/slik-sammenligner-vi">Slik sammenligner vi</Link>.
        </p>
      </div>
    </div>
  );
}
