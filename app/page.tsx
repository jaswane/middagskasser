import { pageMetadata } from "@/lib/seo";
import { PageSchema } from "@/components/page-schema";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  SlidersHorizontal,
  ListChecks,
  Scale,
} from "lucide-react";
import { Comparison } from "@/components/comparison";
import { Sibling } from "@/components/chrome";
import { affiliateFlags } from "@/lib/commercial";
import { editorialProviders } from "@/lib/data";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "/",
  "Hvilken matkasse passer dere?",
  "Sammenlign HelloFresh og Godtlevert på samme kriterier. Se hva som er dokumentert, hva prisen gjelder, og hvilken matkasse som passer dere.",
);
export default function Home() {
  return (
    <>
      <PageSchema path="/" title="Hvilken matkasse passer dere?" />
      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="short-rule" /> MINDRE PLANLEGGING. MER MIDDAG.
          </div>
          <h1>
            Hvilken matkasse
            <br />
            passer <em>dere?</em>
          </h1>
          <p>
            Sammenlign pris, utvalg og fleksibilitet.
            <br className="desktop-break" /> Finn ut hva som passer hverdagen
            deres.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/finn-matkasse">
              Hjelp oss å velge <ArrowRight size={18} />
            </Link>
            <a className="button button-text" href="#sammenligning">
              Sammenlign selv <ArrowDownIcon />
            </a>
          </div>
          <div className="hero-meta">
            <span>
              <Check size={15} /> Ingen registrering
            </span>
            <span>3 korte spørsmål</span>
          </div>
        </div>
        <div className="hero-visual">
          <Image
            src="/images/middag.jpg"
            alt="Fisk med poteter og grønnsaker på en turkis tallerken. Illustrasjonsfoto."
            fill
            priority
            sizes="(max-width: 700px) 100vw, 45vw"
          />
          <div className="image-label">
            <span>HVERDAGSMIDDAGEN,</span>
            <strong>litt enklere.</strong>
          </div>
          <span className="image-caption">
            Illustrasjonsfoto · ingen leverandørtilknytning
          </span>
        </div>
      </section>
      <div className="trust-line container">
        <p>
          Vi sammenligner <strong>Godtlevert og HelloFresh.</strong> To
          alternativer, samme kriterier.
        </p>
        <Link href="/annonselenker">
          Om annonselenker <ArrowUpRight size={13} />
        </Link>
      </div>
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">OVERSIKTEN DU TRENGER</span>
            <h2>To matkasser, side om side.</h2>
          </div>
          <p>
            Start med størrelsen som passer dere.
            <br />
            Se både mulighetene og begrensningene.
          </p>
        </div>
        <Comparison flags={affiliateFlags()} />
      </section>
      <section className="decision-section">
        <div className="container decision-grid">
          <div>
            <span className="eyebrow">BEHOVET DERES AVGJØR</span>
            <h2>
              Det finnes ikke én
              <br />
              matkasse for alle.
            </h2>
            <p>
              Noen vil finne igjen favorittmiddagene. Andre vil prøve noe nytt.
              Og for mange må regnestykket først gå opp.
            </p>
            <Link className="text-link" href="/hellofresh-vs-godtlevert">
              Se hva som faktisk skiller dem <ArrowRight size={17} />
            </Link>
          </div>
          <div className="decision-points">
            <article>
              <span>01</span>
              <div>
                <h3>Hva koster en vanlig uke?</h3>
                <p>
                  Se normalpris og frakt sammen. En førsteukerabatt sier lite om
                  prisen i lengden.
                </p>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>Vil dere spise det som er på menyen?</h3>
                <p>
                  Se på rettene for den aktuelle uken. Antallet alene avgjør
                  ikke om de passer dere.
                </p>
              </div>
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>Passer det med hverdagen?</h3>
                <p>
                  Sjekk levering på adressen deres og fristen for å endre eller
                  hoppe over en uke.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>
      {editorialProviders.map((e) => (
        <section key={e.id} className="section container">
          <div className="decision-grid">
            <div>
              <span className="eyebrow">ET ANNET ALTERNATIV</span>
              <h2>{e.editorial.homeHeading}</h2>
            </div>
            <div>
              <p>{e.editorial.homeTeaser}</p>
              <Link className="text-link" href={`/${e.id}`}>
                Les om {e.name} <ArrowRight size={17} />
              </Link>
              <p>
                <Link href="/matkasser">
                  Se alle matkassene vi har kontrollert
                </Link>
              </p>
            </div>
          </div>
        </section>
      ))}
      <section className="section container">
        <div className="selector-teaser">
          <div className="selector-icon">
            <SlidersHorizontal size={30} strokeWidth={1.5} />
          </div>
          <div>
            <span className="eyebrow">LITT HJELP TIL Å VELGE?</span>
            <h2>La hverdagen deres bestemme.</h2>
            <p>
              Tre spørsmål. En tydelig forklaring på hva som passer – og hva
              dere bør sjekke.
            </p>
          </div>
          <Link href="/finn-matkasse" className="button button-primary">
            Finn vår matkasse <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <section className="container method-section">
        <div>
          <span className="eyebrow">ET VALG DU KAN FORSTÅ</span>
          <h2>
            Åpent om grunnlaget.
            <br />
            Ærlig om forskjellene.
          </h2>
          <Link href="/slik-sammenligner-vi" className="text-link">
            Slik sammenligner vi <ArrowRight size={16} />
          </Link>
        </div>
        <div className="method-item">
          <ListChecks size={26} />
          <h3>Samme målestokk</h3>
          <p>
            De samme feltene for begge. Ukjente opplysninger forblir ukjente.
          </p>
        </div>
        <div className="method-item">
          <Scale size={26} />
          <h3>Ditt behov først</h3>
          <p>
            Provisjon påvirker ikke vurderingen. Vi viser hvorfor et alternativ
            kan passe.
          </p>
        </div>
      </section>
      <div className="container">
        <Sibling />
      </div>
    </>
  );
}
function ArrowDownIcon() {
  return <span aria-hidden="true">↓</span>;
}
