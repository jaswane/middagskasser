import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { PageIntro } from "./chrome";
import { Outbound } from "./outbound";
import { OfferBox } from "./offer";
import {
  providers,
  readFact,
  getQuote,
  formatDate,
  formatPrice,
  formatServing,
  readOptional,
  numberWord,
  listJoin,
  deliverySampleText,
  freshDeliverySamples,
  editorialProviders,
  priceTally,
  type Provider,
} from "@/lib/data";
import { destination } from "@/lib/commercial";
import { AffiliateDisclosure } from "./affiliate-disclosure";
export function ProviderPage({ provider: p }: { provider: Provider }) {
  const sizes = readFact(p.people),
    meals = readFact(p.meals),
    count = readFact(p.selectionCount),
    isG = p.id === "godtlevert";
  if (
    !sizes ||
    !readFact(p.flexibility) ||
    !readFact(p.vegetarian) ||
    !readFact(p.quick)
  )
    return (
      <div className="container page-content">
        <PageIntro eyebrow="OPPLYSNINGER MÅ KONTROLLERES" title={p.name}>
          <p>
            Produktopplysningene trenger en ny kontroll. Vi viser ingen
            gjeldende vurdering før grunnlaget er oppdatert.
          </p>
        </PageIntro>
        <AffiliateDisclosure flags={{ [p.id]: destination(p.id).affiliate }} />
        <Outbound
          id={p.id}
          name={p.name}
          placement="provider_bottom"
          affiliate={destination(p.id).affiliate}
        />
      </div>
    );
  const other = providers.find((x) => x.id !== p.id)!;
  const otherSizes = readFact(other.people),
    otherCount = readFact(other.selectionCount);
  const extraSizes = (otherSizes ?? []).filter((n) => !sizes.includes(n));
  const tally = priceTally(p, other);
  const tallyText = (name: string, wins: number) =>
    `Med oppgitt frakt var ${name} billigst i ${numberWord(wins)} av de ${numberWord(tally.total)} kassestørrelsene begge tilbyr, ved kontrollen ${formatDate(tally.checkedAt)}.`;
  // Box prices by portions (rows) and dinners (columns), fresh quotes only.
  const rows = sizes
    .map((people) => ({
      people,
      cells: (meals ?? []).map((m) => getQuote(p, people, m)),
    }))
    .filter((r) => r.cells.some(Boolean));
  const fresh = rows.flatMap((r) => r.cells).filter((q) => q !== null);
  const example = getQuote(p, 4, 3);
  const prices = fresh.map((q) => q.boxPrice);
  const fee = fresh.find((q) => q.deliveryFee !== null);
  const sampleText = deliverySampleText(p);
  const surcharge = readOptional(p.surcharge);
  return (
    <div className="container page-content">
      <PageIntro
        eyebrow="LEVERANDØREN KORT FORTALT"
        title={`${p.name}: passer det for dere?`}
      >
        <Image
          src={`/brands/${isG ? "godtlevert-logo.svg" : "hellofresh-logo.png"}`}
          alt={`${p.name} logo`}
          width={129}
          height={48}
          style={{ objectFit: "contain", objectPosition: "left" }}
          unoptimized
        />
        <p>{p.description}</p>
      </PageIntro>
      <AffiliateDisclosure flags={{ [p.id]: destination(p.id).affiliate }} />
      <div className="content-grid">
        <div className="prose">
          <h2>Hva koster {p.name}?</h2>
          {fresh.length && fee ? (
            <>
              <p>
                Kassen koster fra {formatPrice(Math.min(...prices))} til{" "}
                {formatPrice(Math.max(...prices))} i uken, etter hvor mange
                porsjoner og middager dere velger. Frakten kommer i tillegg
                {fee.basis === "observed-checkout"
                  ? `, og den var ${formatPrice(fee.deliveryFee!)} da vi sjekket.`
                  : `, og ${p.name} oppgir ${formatPrice(fee.deliveryFee!)} som standardfrakt.`}
              </p>
              <div className="table-scroll">
                <table className="price-grid">
                  <caption>Kassepris per uke før frakt</caption>
                  <thead>
                    <tr>
                      <td />
                      <th scope="colgroup" colSpan={(meals ?? []).length}>
                        Middager per uke
                      </th>
                    </tr>
                    <tr>
                      <th scope="col">Porsjoner</th>
                      {(meals ?? []).map((m) => (
                        <th scope="col" key={m}>
                          {m}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.people}>
                        <th scope="row">{r.people}</th>
                        {r.cells.map((q, i) => (
                          <td key={i}>{q ? formatPrice(q.boxPrice) : "–"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {example && example.deliveryFee !== null && (
                <p>
                  Med <strong>4 porsjoner og 3 middager</strong> blir det{" "}
                  <strong>
                    {formatPrice(example.boxPrice + example.deliveryFee)}
                  </strong>{" "}
                  i uken med frakt, eller{" "}
                  {formatServing(
                    (example.boxPrice + example.deliveryFee) /
                      (example.people * example.meals),
                  )}{" "}
                  per porsjon.
                </p>
              )}
              <p className="neutral-note">
                {fresh[0].addressNote} Prisene gjelder uten introtilbud, ekstra
                varer eller retter med pristillegg. Kontrollert{" "}
                {formatDate(fresh[0].source.checkedAt)}.{" "}
                <a href={fresh[0].source.url}>Kilde til kasseprisen</a> ·{" "}
                <a href={fee.deliverySource.url}>Kilde til frakten</a>
              </p>
              <p>
                Hvem som er billigst for deres størrelse, også per porsjon:{" "}
                <Link href="/billigste-matkasse">Billigste matkasse</Link>.
              </p>
            </>
          ) : (
            <p>
              Prisene må kontrolleres på nytt. Se den gjeldende totalen hos{" "}
              {p.name} før dere bestiller.
            </p>
          )}
          <OfferBox offer={p.offer} name={p.name} />
          <Link className="text-link" href="/hellofresh-vs-godtlevert">
            Sammenlign med {other.name} side om side <ArrowRight size={15} />
          </Link>
          <h2>Hva dere får og velger</h2>
          <p>
            {p.name} sender råvarer og oppskrifter for{" "}
            {sizes.length > 2 &&
            sizes[sizes.length - 1] - sizes[0] + 1 === sizes.length
              ? `${numberWord(sizes[0])} til ${numberWord(sizes[sizes.length - 1])}`
              : listJoin(sizes.map(numberWord), "eller")}{" "}
            porsjoner per middag
            {meals
              ? ` og ${numberWord(meals[0])} til ${numberWord(meals[meals.length - 1])} middager i uken`
              : ""}
            . Dere velger rettene selv fra ukens meny, og menyen har vegetariske
            og raske retter.
          </p>
          <p>
            {count
              ? `${p.name} oppgir ${count} retter per uke på forsiden ved kontroll ${formatDate(p.selectionCount.source.checkedAt)}. `
              : "Det oppgitte antallet retter må kontrolleres igjen. "}
            Tallet er leverandørens eget. Vi har ikke telt unike retter, og
            eldre sider oppgir andre tall.
          </p>
          <h2>Hvor og når {p.name} leverer</h2>
          <p>
            {readOptional(p.coverage)} {readOptional(p.deliveryWindows)}{" "}
            {sampleText} Om dere får levert, ser dere når dere skriver inn
            postnummeret hos {p.name}.
          </p>
          <h2>Pause, endring og avslutning</h2>
          <p>
            {readFact(p.flexibility) || "Vilkårene må kontrolleres igjen."}{" "}
            Abonnementet fortsetter hvis dere ikke gjør endringer innen fristen.{" "}
            {isG
              ? "Godtlevert oppgir normalt tirsdag kl. 23.59 uken før, med mulige avvik ved høytider."
              : "HelloFresh oppgir frister som varierer med leveringsdagen. Første bestilling kan ha særregler."}{" "}
            <a href={p.flexibility.source.url}>Les leverandørens vilkår</a>.
          </p>
          <h2>Hvem passer {p.name} for?</h2>
          <p>
            {isG
              ? "Godtlevert er særlig relevant når dere vil ha en kasse med tre, fem eller seks porsjoner. Det er størrelser vi ikke fant i HelloFreshs planvalg."
              : "HelloFresh er relevant for dere som ønsker to eller fire porsjoner, og vil velge retter fra en meny som endres hver uke."}{" "}
            {tally.total > 0 &&
              tally.aWins > tally.bWins &&
              tallyText(p.name, tally.aWins)}{" "}
            {count &&
              otherCount &&
              count > otherCount &&
              `${p.name} oppgir også flere retter å velge mellom: ${count} i uken, mot ${otherCount} hos ${other.name}.`}
          </p>
          <p>
            Vurderingen bygger på leverandørens dokumentasjon. Vi har ikke
            testet eller smakt maten.
          </p>
          <h2>Viktigste begrensning</h2>
          <p>{p.limitations[0]}</p>
          <p>Sjekk også dette før dere bestiller:</p>
          <ul>
            {surcharge && <li>{surcharge}</li>}
            {p.limitations.slice(1).map((s) => (
              <li key={s}>{s}</li>
            ))}
            <li>
              Allergener og ingredienser må sjekkes per rett. Vegetarisk er ikke
              det samme som vegansk eller allergivennlig.
            </li>
          </ul>
          <Outbound
            id={p.id}
            name={p.name}
            placement="provider_bottom"
            affiliate={destination(p.id).affiliate}
          />
          <p>
            <Link href="/annonselenker">
              Om annonselenker og hvordan vi finansieres
            </Link>
          </p>
          <h2>Når et annet valg kan passe bedre</h2>
          <ul>
            {extraSizes.length > 0 && (
              <li>
                Er dere {listJoin(extraSizes.map(numberWord), "eller")}, har{" "}
                {other.name} kasser i den størrelsen.{" "}
                <Link href={`/${other.id}`}>Les om {other.name}</Link>.
              </li>
            )}
            {count && otherCount && otherCount > count && (
              <li>
                {other.name} oppgir flere retter å velge mellom: {otherCount} i
                uken mot {count} hos {p.name}.
              </li>
            )}
            {tally.total > 0 && tally.bWins > tally.aWins && (
              <li>
                Er dere{" "}
                {listJoin(
                  sizes.filter((n) => otherSizes?.includes(n)).map(numberWord),
                  "eller",
                )}{" "}
                og prisen er viktigst: {tallyText(other.name, tally.bWins)}{" "}
                <Link href="/hellofresh-vs-godtlevert">
                  Se prisene side om side
                </Link>
                .
              </li>
            )}
            {editorialProviders.map((e) => (
              <li key={e.id}>
                {e.editorial.homeTeaser}{" "}
                <Link href={`/${e.id}`}>Les om {e.name}</Link>.
              </li>
            ))}
          </ul>
          <p>
            <Link href="/beste-matkasse">
              Se hvilken matkasse som peker seg ut for ulike behov
            </Link>
          </p>
          <h2>Kilder og kontroll</h2>
          <ul className="source-list">
            {[
              ...new Map(
                // One entry per URL; later entries win, so samples come first.
                [
                  ...freshDeliverySamples(p).map((s) => s.source),
                  ...(surcharge && p.surcharge ? [p.surcharge.source] : []),
                  ...p.sources,
                  p.quick.source,
                  p.vegetarian.source,
                  p.delivery.source,
                  ...(p.coverage ? [p.coverage.source] : []),
                  ...(p.deliveryWindows ? [p.deliveryWindows.source] : []),
                ].map((s) => [s.url, s]),
              ).values(),
            ].map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.title}
                </a>
                <br />
                Kontrollert {formatDate(s.checkedAt)}
              </li>
            ))}
          </ul>
          <Link href="/slik-sammenligner-vi">
            Les om metoden og oppdateringsrutinen
          </Link>
        </div>
        <aside className="fact-panel">
          <h3>{p.name} i korte trekk</h3>
          <dl>
            <div>
              <dt>Porsjoner per middag</dt>
              <dd>{sizes?.join(", ") || "Må kontrolleres"}</dd>
            </div>
            <div>
              <dt>Middager per uke</dt>
              <dd>{meals?.join(", ") || "Må kontrolleres"}</dd>
            </div>
            <div>
              <dt>Vegetar og raske retter</dt>
              <dd>Begge finnes i menyen</dd>
            </div>
            <div>
              <dt>Pause og endring</dt>
              <dd>Før ukens endringsfrist</dd>
            </div>
            <div>
              <dt>Levering</dt>
              <dd>Sjekk din adresse</dd>
            </div>
          </dl>
          <Link className="text-link" href="/hellofresh-vs-godtlevert">
            Sammenlign med {other.name} <ArrowRight size={15} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
