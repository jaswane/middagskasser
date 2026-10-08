import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { PageIntro } from "./chrome";
import { Outbound } from "./outbound";
import { OfferBox } from "./offer";
import {
  readFact,
  getQuote,
  formatDate,
  formatPrice,
  formatServing,
  readOptional,
  editorialProviders,
  type Provider,
} from "@/lib/data";
import { destination } from "@/lib/commercial";
import { AffiliateDisclosure } from "./affiliate-disclosure";
export function ProviderPage({ provider: p }: { provider: Provider }) {
  const q = getQuote(p, 4, 3),
    sizes = readFact(p.people),
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
        <p>
          {p.description} Her er prisgrunnlaget, mulighetene og begrensningene
          du bør kjenne til.
        </p>
      </PageIntro>
      <AffiliateDisclosure flags={{ [p.id]: destination(p.id).affiliate }} />
      <div className="content-grid">
        <div className="prose">
          <h2>Hvem kan {p.name} passe for?</h2>
          <p>
            {isG
              ? "Godtlevert er særlig relevant når dere vil velge en kasse med tre, fem eller seks porsjoner. Det er størrelser vi ikke fant i HelloFreshs planvalg."
              : "HelloFresh er relevant for dere som ønsker to eller fire porsjoner, og vil velge retter fra en meny som endres hver uke."}
          </p>
          <p>
            Vurderingen bygger på leverandørens dokumentasjon. Vi har ikke
            testet eller smakt maten.
          </p>
          <h2>Hva koster en vanlig uke?</h2>
          {q && q.deliveryFee !== null ? (
            <>
              <p>
                Eksemplet med <strong>4 porsjoner og 3 middager</strong> koster{" "}
                <strong>{formatPrice(q.boxPrice + q.deliveryFee!)}</strong>,
                inkludert {formatPrice(q.deliveryFee!)} oppgitt frakt. Det
                tilsvarer {formatServing((q.boxPrice + q.deliveryFee!) / 12)}{" "}
                per porsjon.
              </p>
              <p className="neutral-note">
                {q.addressNote} Prisen gjelder uten introtilbud, ekstra varer
                eller retter med pristillegg. Kontrollert{" "}
                {formatDate(q.source.checkedAt)}.
              </p>
              <p>
                <a href={q.source.url}>Kilde til kasseprisen</a> ·{" "}
                <a href={q.deliverySource.url}>Kilde til frakten</a>
              </p>
            </>
          ) : (
            <p>
              Priseksemplet må kontrolleres på nytt. Se den gjeldende totalen
              hos leverandøren før du bestiller.
            </p>
          )}
          <Link className="text-link" href="/hellofresh-vs-godtlevert">
            Sammenlign andre kassestørrelser <ArrowRight size={15} />
          </Link>
          <h2>Utvalg og retter</h2>
          <p>
            {count
              ? `${p.name} oppgir ${count} retter per uke på forsiden ved kontroll ${formatDate(p.selectionCount.source.checkedAt)}. `
              : "Det oppgitte antallet retter må kontrolleres igjen. "}
            Begge har vegetariske og raske alternativer. Se alltid menyen for
            den uken dere skal bestille.
          </p>
          <p>
            Utvalgstallet er leverandørens egen opplysning. Eldre sider oppgir
            andre tall, og vi har ikke telt unike retter eller kontrollert hvor
            mange som har pristillegg.
          </p>
          <h2>Pause, endring og avslutning</h2>
          <p>
            {readFact(p.flexibility) || "Vilkårene må kontrolleres igjen."}{" "}
            Abonnementet fortsetter hvis du ikke gjør endringer innen fristen.
            Sjekk alltid den konkrete fristen i kontoen din.
          </p>
          <p>
            {isG
              ? "Godtlevert oppgir normalt tirsdag kl. 23.59 uken før, med mulige avvik ved høytider."
              : "HelloFresh oppgir frister som varierer med leveringsdagen. Første bestilling kan ha særregler."}{" "}
            <a href={p.flexibility.source.url}>Les leverandørens vilkår</a>.
          </p>
          {(readOptional(p.coverage) || readOptional(p.deliveryWindows)) && (
            <>
              <h2>Hvor og når {p.name} leverer</h2>
              <p>
                {readOptional(p.coverage)} {readOptional(p.deliveryWindows)} Om
                dere får levert, ser dere først når dere skriver inn
                postnummeret hos {p.name}.
              </p>
            </>
          )}
          <h2>Slik kommer dere i gang</h2>
          <ol
            style={{
              listStyle: "decimal",
              paddingLeft: 22,
              color: "var(--muted)",
            }}
          >
            <li>Kontroller levering til adressen deres.</li>
            <li>Velg antall porsjoner og middager.</li>
            <li>Se på rettene, eventuelle tillegg og totalpris.</li>
            <li>Les abonnementsvilkårene og fristen før dere bestiller.</li>
          </ol>
          <OfferBox offer={p.offer} name={p.name} />
          <h2>Dette bør dere særlig sjekke</h2>
          <ul>
            {p.limitations.map((s) => (
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
          {editorialProviders.length > 0 && (
            <>
              <h2>Et annet alternativ</h2>
              {editorialProviders.map((e) => (
                <p key={e.id}>
                  {e.editorial.homeTeaser}{" "}
                  <Link href={`/${e.id}`}>Les om {e.name}</Link>.
                </p>
              ))}
            </>
          )}
          <h2>Kilder og kontroll</h2>
          <ul className="source-list">
            {[
              ...new Map(
                [
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
              <dd>{readFact(p.meals)?.join(", ") || "Må kontrolleres"}</dd>
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
            Sammenlign med {isG ? "HelloFresh" : "Godtlevert"}{" "}
            <ArrowRight size={15} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
