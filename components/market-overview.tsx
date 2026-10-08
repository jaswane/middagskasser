import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageIntro } from "./chrome";
import {
  allProviders,
  readFact,
  readOptional,
  getQuote,
  formatDate,
  formatPrice,
  numberWord,
  listJoin,
  freshDeliverySamples,
  type Provider,
  type ProviderSlug,
} from "@/lib/data";
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
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
// The four models as answers to two questions. Names come from the market
// list, so the map never names a service the overview does not describe.
const raw = (menu: MarketEntry["menu"]) =>
  market.filter((e) => e.type === "ravarekasse" && e.menu === menu);
const branches = [
  {
    answer: "Ja, vi lager maten",
    question: "Vil dere velge rettene selv?",
    leaves: [
      {
        tag: "Ja",
        title: "Råvarekasse med valg av retter",
        text: "Råvarer og oppskrifter. Dere velger rettene fra ukens meny.",
        entries: raw("choose"),
      },
      {
        tag: "Nei",
        title: "Råvarekasse med fast meny",
        text: "Råvarer og oppskrifter, men kokken har bestemt rettene.",
        entries: raw("fixed"),
      },
    ],
  },
  {
    answer: "Nei, den skal være ferdig",
    question: "Handler det om trening eller kalorier?",
    leaves: [
      {
        tag: "Nei",
        title: "Ferdige middager",
        text: "Middagen er laget og skal bare varmes opp.",
        entries: market.filter((e) => e.type === "ferdigmat"),
      },
      {
        tag: "Ja",
        title: "Trenings- og makromåltider",
        text: "Ferdige måltider satt sammen for et kalori- eller treningsmål.",
        entries: market.filter((e) => e.type === "trening"),
      },
    ],
  },
];
function ModelMap() {
  const sorted = (entries: MarketEntry[]) =>
    [...entries].sort((a, b) => a.name.localeCompare(b.name, "nb"));
  return (
    <section className="model-map" aria-labelledby="model-map-title">
      <h2 id="model-map-title">Fire typer, to spørsmål</h2>
      <p className="model-root">Vil dere lage middagen selv?</p>
      <div className="model-branches">
        {branches.map((b) => (
          <div className="model-branch" key={b.answer}>
            <p className="model-answer">{b.answer}</p>
            <p className="model-question">{b.question}</p>
            <ul className="model-leaves">
              {b.leaves.map((l) => (
                <li key={l.title}>
                  <span className="model-tag">{l.tag}</span>
                  <h3>{l.title}</h3>
                  <p>{l.text}</p>
                  <p className="model-names">
                    {sorted(l.entries).map((e, i) => (
                      <span key={e.id}>
                        {i > 0 && (i === l.entries.length - 1 ? " og " : ", ")}
                        <a href={`#${e.id}`}>{e.name}</a>
                      </span>
                    ))}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
// Box price and delivery for the sizes every råvarekasse with a profile
// offers. Hidden as soon as one of them lacks a fresh price.
function PriceExamples() {
  const ps = market
    .filter((e) => e.type === "ravarekasse" && e.profile)
    .sort((a, b) => a.name.localeCompare(b.name, "nb"))
    .map((e) => allProviders.find((p) => p.id === e.profile))
    .filter((p): p is Provider<ProviderSlug> => !!p);
  if (ps.length < 3) return null;
  const sizes = ps[0].quotes
    .map((q) => ({ people: q.people, meals: q.meals }))
    .filter(({ people, meals }) =>
      ps.every((p) => getQuote(p, people, meals)?.deliveryFee != null),
    );
  if (!sizes.length) return null;
  const used = sizes.flatMap(({ people, meals }) =>
    ps.map((p) => ({ p, q: getQuote(p, people, meals)! })),
  );
  const dates = [...new Set(used.map((u) => u.q.source.checkedAt))];
  const names = (pred: (u: (typeof used)[number]) => boolean) => [
    ...new Set(used.filter(pred).map((u) => u.p.name)),
  ];
  const observed = names((u) => u.q.basis === "observed-checkout");
  const standard = names((u) => u.q.basis === "calculated-standard");
  // Postcodes where every observed provider showed the same fee.
  const postcodes = freshDeliverySamples(ps[0])
    .map((s) => s.postcode)
    .filter((code) =>
      ps
        .filter((p) => observed.includes(p.name))
        .every((p) =>
          freshDeliverySamples(p).some(
            (s) => s.postcode === code && s.fee !== null,
          ),
        ),
    );
  const surcharge = ps
    .filter((p) => readOptional(p.surcharge))
    .map((p) => p.name);
  return (
    <section aria-labelledby="price-examples-title">
      <h2 id="price-examples-title">Sammenlignbare priseksempler</h2>
      <p>
        De {numberWord(ps.length)} råvarekassene har
        {sizes.length <= 2 ? " bare " : " "}
        {sizes.length === 1
          ? "én kassestørrelse"
          : `${numberWord(sizes.length)} kassestørrelser`}{" "}
        felles. Her er ordinær ukepris uten introtilbud, med frakten for seg.
      </p>
      <div className="price-examples">
        {sizes.map(({ people, meals }) => (
          <table key={`${people}-${meals}`}>
            <caption>
              {cap(numberWord(people))} porsjoner, {numberWord(meals)} middager
            </caption>
            <thead>
              <tr>
                <th scope="col">Matkasse</th>
                <th scope="col">Kasse</th>
                <th scope="col">Frakt</th>
              </tr>
            </thead>
            <tbody>
              {ps.map((p) => {
                const q = getQuote(p, people, meals)!;
                return (
                  <tr key={p.id}>
                    <th scope="row">{p.name}</th>
                    <td>{formatPrice(q.boxPrice)}</td>
                    <td>
                      {formatPrice(q.deliveryFee!)}
                      {q.basis === "calculated-standard" && (
                        <small> oppgitt standard</small>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ))}
      </div>
      <p className="neutral-note">
        Kontrollert {listJoin(dates.map(formatDate))}.{" "}
        {observed.length > 0 && postcodes.length > 0 && (
          <>
            {listJoin(observed)} viste denne frakten for postnummer{" "}
            {listJoin(postcodes)}.{" "}
          </>
        )}
        {standard.length > 0 && (
          <>
            {listJoin(standard)} viser ikke frakten for en adresse før dere har
            laget konto, så her står oppgitt standardfrakt.{" "}
          </>
        )}
        {ps.some((p) => p.id === "kokkeloren") &&
          "Kokkelørens kasser for to og fire voksne er regnet som to og fire porsjoner. "}
        {surcharge.length > 0 &&
          `Hos ${listJoin(surcharge)} koster enkelte retter ekstra. `}
        Totalen kan også endre seg med adresse og leveringstidspunkt.
      </p>
    </section>
  );
}
export function MarketOverview() {
  const profiles = market.filter((e) => e.profile).length;
  const rawKits = market
    .filter((e) => e.type === "ravarekasse")
    .sort((a, b) => a.name.localeCompare(b.name, "nb"));
  return (
    <div className="container page-content">
      <PageIntro eyebrow="MARKEDSOVERSIKT" title="Matkasser i Norge">
        <p>
          Vi har kontrollert {numberWord(market.length)} tjenester som leverer
          middag hjem i Norge. {cap(numberWord(rawKits.length))} av dem er
          matkasser med råvarer og oppskrift:{" "}
          {listJoin(rawKits.map((e) => e.name))}. De andre leverer ferdige
          måltider. For hver tjeneste står hvem den passer for, den viktigste
          forskjellen og den viktigste begrensningen. De {numberWord(profiles)}{" "}
          matkassene med lenke til profil har vi skrevet mer utfyllende om.
        </p>
      </PageIntro>
      <ModelMap />
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
                <article key={e.id} id={e.id} className="market-entry">
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
        <PriceExamples />
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
