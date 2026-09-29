import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageSchema } from "@/components/page-schema";
import { validGaId } from "@/lib/measurement";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageIntro, Sibling, Brand } from "@/components/chrome";
import { Comparison } from "@/components/comparison";
import { ProviderPage } from "@/components/provider-page";
import { OfferBox } from "@/components/offer";
import { ConsentSettings } from "@/components/analytics";
import {
  getProvider,
  providers,
  providerSources,
  readFact,
  formatDate,
  type Offer,
} from "@/lib/data";
import { affiliateFlags } from "@/lib/commercial";
export const dynamic = "force-dynamic";
const pages: Record<
  string,
  { title: string; description: string; eyebrow: string }
> = {
  hellofresh: {
    title: "HelloFresh: pris, utvalg og begrensninger",
    description:
      "Se kontrollerte priseksempler, porsjonsvalg og vilkår for HelloFresh. Sammenlign med Godtlevert før du velger.",
    eyebrow: "LEVERANDØR",
  },
  godtlevert: {
    title: "Godtlevert: pris, utvalg og begrensninger",
    description:
      "Se kontrollerte priseksempler, porsjonsvalg og vilkår for Godtlevert. Sammenlign med HelloFresh før du velger.",
    eyebrow: "LEVERANDØR",
  },
  "hellofresh-vs-godtlevert": {
    title: "HelloFresh eller Godtlevert?",
    description:
      "Sammenlign like pakkestørrelser, normalpris med oppgitt frakt, utvalg og fleksibilitet. Se hva som skiller HelloFresh og Godtlevert.",
    eyebrow: "DIREKTE SAMMENLIGNING",
  },
  "slik-sammenligner-vi": {
    title: "Slik sammenligner vi",
    description:
      "Kilder, kriterier, priskontroll og vurderingsmetode. Se hva vi vet, hva vi ikke vet, og hvordan annonselenker fungerer.",
    eyebrow: "METODE OG TILLIT",
  },
  annonselenker: {
    title: "Åpent om annonselenker",
    description:
      "Slik finansieres Middagskasser.no, og slik skiller vi kommersielle avtaler fra vurderingen av matkasser.",
    eyebrow: "KOMMERSIELLE RELASJONER",
  },
  om: {
    title: "Litt enklere å velge middagshjelp",
    description:
      "Middagskasser.no hjelper norske husholdninger å sammenligne matkasser. Et søsterprodukt til Middagen.no.",
    eyebrow: "OM MIDDAGSKASSER.NO",
  },
  kontakt: {
    title: "Kontakt oss",
    description:
      "Meld fra om en feil, en utdatert pris eller noe som mangler i sammenligningen.",
    eyebrow: "SPØRSMÅL ELLER EN RETTELSE?",
  },
  personvern: {
    title: "Personvern og dine valg",
    description:
      "Hva som behandles når du bruker Middagskasser.no, og hvordan du styrer valgfri statistikk.",
    eyebrow: "PERSONVERN",
  },
  designoversikt: {
    title: "Designoversikt og tilstander",
    description:
      "Internt designutkast: familie, komponenter og tilbudstilstander.",
    eyebrow: "INTERNT PRODUKT- OG DESIGNUTKAST",
  },
};
export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}
// Own keys only: inherited names such as "constructor" must not resolve to a page.
function findPage(slug: string) {
  return Object.hasOwn(pages, slug) ? pages[slug] : undefined;
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params,
    p = findPage(slug);
  if (!p)
    return {
      title: "Siden finnes ikke",
      robots: { index: false, follow: false },
    };
  return {
    ...pageMetadata(`/${slug}`, p.title, p.description),
    ...(slug === "designoversikt"
      ? { robots: { index: false, follow: false } }
      : {}),
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params,
    p = findPage(slug);
  if (!p) notFound();
  const fresh = providers.every(
    (p) =>
      readFact(p.people) &&
      readFact(p.meals) &&
      readFact(p.selectionCount) &&
      readFact(p.quick) &&
      readFact(p.vegetarian) &&
      readFact(p.flexibility),
  );
  const provider = getProvider(slug);
  if (provider)
    return (
      <>
        <PageSchema path={`/${slug}`} title={p.title} />
        <ProviderPage provider={provider} />
      </>
    );
  return (
    <div className="container page-content">
      {slug !== "designoversikt" && (
        <PageSchema path={`/${slug}`} title={p.title} />
      )}
      <PageIntro eyebrow={p.eyebrow} title={p.title}>
        <p>
          {slug === "hellofresh-vs-godtlevert"
            ? "To matkasser med mye til felles. Størrelsen dere trenger, priseksemplet og ukens retter gir et bedre svar enn en generell vinner."
            : p.description}
        </p>
      </PageIntro>
      {slug === "hellofresh-vs-godtlevert" ? (
        <>
          <Comparison full flags={affiliateFlags()} />
          {fresh ? (
            <>
              <div className="two-up">
                <article>
                  <h3>Når er Godtlevert særlig aktuelt?</h3>
                  <p>
                    Når dere trenger tre, fem eller seks porsjoner i én kasse.
                    Godtlevert oppgir også et større utvalg, men sjekk hvor
                    mange av rettene dere faktisk vil spise.
                  </p>
                  <Link className="text-link" href="/godtlevert">
                    Mer om Godtlevert <ArrowRight size={15} />
                  </Link>
                </article>
                <article>
                  <h3>Når er HelloFresh særlig aktuelt?</h3>
                  <p>
                    Når to eller fire porsjoner passer, og priseksemplet for
                    deres pakke er lavere. Sammenlign alltid med samme antall
                    middager og se menyen før bestilling.
                  </p>
                  <Link className="text-link" href="/hellofresh">
                    Mer om HelloFresh <ArrowRight size={15} />
                  </Link>
                </article>
              </div>
              <div className="prose">
                <h2>Hvor er forskjellene små?</h2>
                <p>
                  Begge lar dere velge retter, tilbyr vegetariske og raske
                  alternativer og lar dere pause før ukens frist. Vi har ikke
                  grunnlag for å si at én av dem generelt er mer barnevennlig,
                  smaker bedre eller er sunnere.
                </p>
                <h2>Pris er mer enn den første rabatten</h2>
                <p>
                  Tabellen bruker ordinær kassepris og oppgitt frakt.
                  Premiumretter og andre tillegg er ikke med. Priseksemplene kan
                  endre seg med størrelse og adresse; derfor kårer vi ikke en
                  generell prisvinner.
                </p>
                <h2>Hvilke retter passer familien?</h2>
                <p>
                  Se på ukens faktiske meny sammen. Sjekk allergener,
                  tilberedningstid og antall vegetarretter dere ønsker.
                  Leverandørens totale utvalg alene svarer ikke på dette.
                </p>
                <details className="faq">
                  <summary>Kan vi bytte eller hoppe over uker?</summary>
                  <p>
                    Begge tilbyr pause og endringer. Fristen gjelder også om
                    dere er bortreist. Kontroller den konkrete fristen og
                    eventuelle regler for første bestilling.
                  </p>
                </details>
                <details className="faq">
                  <summary>Har dere testet matkassene selv?</summary>
                  <p>
                    Nei. Dette er en dokumentert sammenligning av leverandørenes
                    egne opplysninger. Vi gir ingen smakspoeng, stjerner eller
                    påståtte brukererfaringer.
                  </p>
                </details>
                <p>
                  <Link href="/slik-sammenligner-vi">
                    Les metoden og kildegrunnlaget
                  </Link>{" "}
                  eller <Link href="/finn-matkasse">prøv matkassevelgeren</Link>
                  .
                </p>
              </div>
            </>
          ) : (
            <p className="neutral-note">
              Leverandørfunksjonene trenger ny kontroll. Vi viser ingen
              gjeldende vurdering før grunnlaget er oppdatert.
            </p>
          )}
        </>
      ) : slug === "slik-sammenligner-vi" ? (
        <Method />
      ) : slug === "annonselenker" ? (
        <Affiliate />
      ) : slug === "om" ? (
        <About />
      ) : slug === "kontakt" ? (
        <Contact />
      ) : slug === "personvern" ? (
        <Privacy />
      ) : (
        <Design />
      )}
    </div>
  );
}
function Method() {
  return (
    <div className="prose">
      <h2>Vi sammenligner to leverandører</h2>
      <p>
        Utvalget er foreløpig Godtlevert og HelloFresh. Begge tilbyr matkasser i
        Norge, har tilgjengelig produktdokumentasjon og er med i eierens
        bekreftede affiliategrunnlag. Dette er ikke en kartlegging av hele
        markedet. Flere kan tas inn hvis de tilfører sammenligningen verdi, også
        uten affiliateavtale.
      </p>
      <h2>Samme kriterier, alfabetisk rekkefølge</h2>
      <p>
        Vi sammenligner porsjoner, middager, ordinær pris, frakt, rettsvalg,
        vegetariske og raske alternativer, pause og levering. Godtlevert står
        først fordi navnene sorteres alfabetisk. Plasseringen er ingen
        anbefaling.
      </p>
      <h2>Slik kontrollerer vi pris</h2>
      <p>
        Den 28.09.2026 leste vi åtte like pakkestørrelser i begge leverandørenes
        bestillingsflyt. Ingen bestilling ble gjort. Vi brukte normalprisen,
        uten velkomsttilbud, plusretter eller ekstra varer.
      </p>
      <ul>
        <li>HelloFresh: kasse og frakt ble lest sammen for postnummer 0150.</li>
        <li>
          Godtlevert: ordinær kassepris ble lest i planvalget. Totalen er
          beregnet med standardfrakt fra hjelpesenteret; adressepris er ikke
          kontrollert.
        </li>
        <li>
          Pris per porsjon er totalen delt på porsjoner per middag og antall
          middager.
        </li>
        <li>
          Mangler pris eller frakt, kårer vi ingen prisfordel. Priser eldre enn
          30 dager tas ut av den aktuelle sammenligningen til de kontrolleres
          igjen.
        </li>
      </ul>
      <h2>Hva betyr oppgitt utvalg?</h2>
      <p>
        Forsidene oppgir ulike antall retter enn enkelte eldre undersider. Vi
        bruker forsidens datert oppgitte tall, merker dem som
        leverandøropplysninger og omtaler usikkerheten. Vi har ikke telt unike
        retter selv. Tallene er ikke en kvalitetsvurdering.
      </p>
      <h2>Slik fungerer matkassevelgeren</h2>
      <p>
        Først sjekker vi om valgt porsjonsstørrelse og antall middager støttes.
        Deretter sammenligner vi det dere prioriterer: standardpris eller
        oppgitt utvalg. En dokumentert fordel gir ett preferansepoeng; det er
        ikke en produktkarakter. Ingen klar prioritet eller like resultater gir
        ingen vinner.
      </p>
      <p>
        Et ukjent felt gir aldri minuspoeng. Det forklares som manglende
        dokumentasjon. Provisjon, kampanjer og affiliateavtaler brukes ikke i
        velgeren.
      </p>
      <h2>Dette har vi ikke undersøkt</h2>
      <p>
        Vi har ikke smakt maten, kontrollert porsjonene med en familie, målt
        tilberedningstid eller testet levering. Ord som «godt for» er en
        vurdering av dokumenterte valg, ikke et testresultat.
      </p>
      <h2>Kontroll og vedlikehold</h2>
      <p>
        Pris, frakt, oppgitt utvalg og lenker skal kontrolleres månedlig.
        Funksjoner og vilkår kontrolleres minst hvert kvartal. Tilbud krever
        egne vilkår, gyldighetsperiode og kontroll. Kjente feil rettes straks.
        En kontrolldato endres bare når opplysningen faktisk er kontrollert.
      </p>
      <h2>Kilder</h2>
      <ul className="source-list">
        {providers.flatMap(providerSources).map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.title}
            </a>{" "}
            – kontrollert {formatDate(s.checkedAt)}
          </li>
        ))}
      </ul>
      <h2>Finansiering og rettelser</h2>
      <p>
        Vi kan få provisjon fra merkede annonselenker. Vi legger ikke på et eget
        gebyr, og provisjon bestemmer ikke vurderingen.{" "}
        <Link href="/annonselenker">Les om annonselenker</Link>.
      </p>
      <p>
        Har du funnet en feil?{" "}
        <Link href="/kontakt">Meld fra via kontaktsiden</Link>, gjerne med lenke
        til kilden og når du observerte opplysningen.
      </p>
    </div>
  );
}
function Affiliate() {
  return (
    <div className="prose">
      <h2>Hva er en annonselenke?</h2>
      <p>
        En merket annonselenke kan gi Middagskasser.no provisjon hvis du
        bestiller hos leverandøren. Vi legger ikke på et eget gebyr. Et
        eventuelt tilbud gjelder etter leverandørens egne vilkår.
      </p>
      <h2>Kommersielle avtaler og vurderinger holdes adskilt</h2>
      <p>
        Eieren har bekreftet affiliateprogrammer for HelloFresh og Godtlevert
        gjennom Adtraction. Satser og vilkår vedlikeholdes separat fra
        produktdata. Provisjon brukes aldri som faktor i sortering eller
        matkassevelger.
      </p>
      <p>
        Vanlige leverandørlenker merkes ikke som annonselenker. Kommersielle
        knapper får teksten «Annonselenke» synlig ved knappen og teknisk merking
        for søkemotorer.
      </p>
      <p>
        Knappene videre til Godtlevert og HelloFresh går foreløpig via
        eButikker.no, som også drives av Swane Creative. eButikker.no kan
        inneholde annonselenker, og vi kan motta provisjon dersom du går videre
        og handler.
      </p>
      <h2>Du skal få verdi før du klikker</h2>
      <p>
        Sammenligning, prisgrunnlag og begrensninger vises før
        leverandørknappene. Du kan bruke hele verktøyet uten å gå videre eller
        bestille.
      </p>
      <h2>Hvem bestemmer etter klikket?</h2>
      <p>
        Leverandøren er ansvarlig for bestilling, gjeldende pris, abonnement,
        levering og kundeservice. Dersom du følger en annonselenke, kan
        affiliatenettverket og leverandøren behandle opplysninger etter egne
        personvernvilkår.
      </p>
      <p>
        <Link href="/slik-sammenligner-vi">Se hvordan vi sammenligner</Link> ·{" "}
        <Link href="/personvern">Les om personvern</Link>
      </p>
    </div>
  );
}
function About() {
  return (
    <>
      <div className="prose">
        <h2>En norsk beslutningshjelper</h2>
        <p>
          Middagskasser.no skal gjøre det enklere å svare på ett spørsmål:
          «Hvilken matkasse passer oss?» Du skal kunne se forskjellene, forstå
          prisen og kjenne begrensningene før du bestiller.
        </p>
        <h2>To produkter, to middagsbehov</h2>
        <p>
          Andreas står bak Middagskasser.no og Middagen.no gjennom Swane
          Creative. Middagen.no handler om hva dere skal spise. Middagskasser.no
          handler om hvordan dere kan slippe noe av planleggingen.
        </p>
        <h2>Åpent om det vi vet</h2>
        <p>
          Vi sammenligner foreløpig to leverandører. Det er bedre med en liten
          sammenligning med tydelig grunnlag enn en lang liste som lover mer enn
          den kan dokumentere.
        </p>
        <p>
          <Link href="/slik-sammenligner-vi">Les om kilder og metode</Link>.
        </p>
      </div>
      <Sibling />
    </>
  );
}
function Contact() {
  return (
    <div className="prose">
      <h2>En feil, en opplysning eller et spørsmål?</h2>
      <p>
        Skriv til{" "}
        <a href="mailto:kontakt@swanecreative.no">kontakt@swanecreative.no</a>.
      </p>
      <p>
        Ved en rettelse: send gjerne sidelenken, hva som er feil, kilden og
        datoen du så opplysningen. Ikke send betalingsinformasjon eller
        bestillingsnummer.
      </p>
      <h2>Spørsmål om en bestilling</h2>
      <p>
        Ta kontakt med matkasseleverandøren direkte ved spørsmål om levering,
        betaling eller abonnement. Middagskasser.no tar ikke imot bestillinger.
      </p>
      <h2>Kommersielle henvendelser</h2>
      <p>
        Vi vurderer relevante samarbeid. En kommersiell avtale kjøper ikke en
        bedre plassering i den redaksjonelle sammenligningen.
      </p>
    </div>
  );
}
function Privacy() {
  const ready =
    process.env.PRIVACY_OPERATIONS && process.env.PRIVACY_CONTACT_RETENTION;
  return (
    <div className="prose">
      <h2>Når du bruker velgeren</h2>
      <p>
        Behandlingsansvarlig: Swane Creative ENK, org.nr. 917 248 834.{" "}
        <Link href="/kontakt">Kontakt oss om personvern</Link>.
      </p>
      <p>
        Svarene behandles i nettleseren mens siden er åpen. Vi oppretter ingen
        konto eller lagret profil, og ber ikke om navn, adresse eller sensitive
        opplysninger.
      </p>
      <h2>Statistikk er valgfritt</h2>
      <p>
        {validGaId(process.env.NEXT_PUBLIC_GA_ID)
          ? "Hvis du samtykker, brukes Google Analytics 4 til å måle sidevisninger og bruk av velger og lenker. Målingen sendes ikke før samtykke."
          : "Valgfri besøksstatistikk er ikke aktivert. Ingen Google Analytics-kode lastes inn."}{" "}
        Avvisning skal være like lett som aksept.
      </p>
      <p>
        Ved samtykke mottar Google tekniske nettleseropplysninger og hendelser
        om sidevisninger, valgte porsjoner, middager, prioritet og lenkeklikk.
        Vi sender ikke navn, e-post, postnummer, fritekst, søkeparametre eller
        nettadressen du kom fra. Vi bruker ikke Google Signals eller
        annonsepersonalisering. Behandlingsgrunnlaget for statistikken er
        samtykke.
      </p>
      <p>
        GA-informasjonskapslene «_ga» og «_ga_…» kan skille mellom besøk og
        økter. De får maksimalt 180 dagers levetid hos oss.{" "}
        {process.env.GA_RETENTION_MONTHS
          ? `Hendelses- og brukerdata beholdes i ${process.env.GA_RETENTION_MONTHS} måneder i GA4. Aggregerte rapporter kan beholdes lenger.`
          : "Lagringstid i GA4 må bekreftes før statistikken aktiveres offentlig."}{" "}
        Google kan behandle opplysninger utenfor EØS.{" "}
        <a href="https://policies.google.com/technologies/partner-sites?hl=no">
          Les hvordan Google behandler opplysninger
        </a>
        .
      </p>
      <ConsentSettings />
      <h2>Lokalt lagret valg</h2>
      <p>
        Når statistikk er tilgjengelig, kan valget ditt lagres lokalt under
        «middagskasser-statistikk» i inntil 180 dager. Deretter ber vi om et
        nytt valg. Selve velgersvarene lagres ikke der. Bildet og skrifttypene
        hentes uten eksterne font- eller bildesporere.
      </p>
      <h2>Teknisk drift og kontakt</h2>
      <p>
        {process.env.PRIVACY_OPERATIONS ||
          "Driftsleverandør, tilgangslogger, databehandlere og eventuelle overføringer må bekreftes før offentlig lansering."}{" "}
        E-post som du sender til oss, behandles for å svare på henvendelsen.{" "}
        {process.env.PRIVACY_CONTACT_RETENTION ||
          "Lagringstid og behandlingsgrunnlag for henvendelser må bekreftes før offentlig lansering."}{" "}
        <Link href="/kontakt">Kontakt Swane Creative</Link> ved spørsmål om
        behandlingen eller rettighetene dine.
      </p>
      <p>
        Du kan be om innsyn, retting, sletting eller begrensning, og der
        vilkårene er oppfylt protestere eller be om dataportabilitet. Du kan
        trekke tilbake samtykket uten at det påvirker lovligheten av tidligere
        behandling. Du kan også{" "}
        <a href="https://www.datatilsynet.no/om-datatilsynet/kontakt-oss/klage-til-datatilsynet/">
          klage til Datatilsynet
        </a>
        .
      </p>
      <h2>Når du går videre</h2>
      <p>
        Knappene videre til Godtlevert og HelloFresh går foreløpig via
        eButikker.no. Når du klikker, forlater du Middagskasser.no, og da
        gjelder{" "}
        <a href="https://www.ebutikker.no/personvernerklaering/">
          personvernerklæringen
        </a>{" "}
        og bruken av informasjonskapsler hos eButikker.no.
      </p>
      <p>
        Leverandører og eventuelt affiliatenettverket har egne vilkår for
        personvern. Se også{" "}
        <Link href="/annonselenker">hvordan annonselenker fungerer</Link>.
      </p>
      {!ready && (
        <p className="neutral-note">
          Denne forhåndsvisningen er ikke klar for offentlig lansering.
          Opplysninger om drift og lagring må bekreftes først.
        </p>
      )}
    </div>
  );
}
function Design() {
  const example: Offer = {
    headline: "Eksempel: rabatt på første kasse",
    description:
      "Kun for å vurdere utforming, vilkår og CTA. Dette er ingen faktisk kampanje hos leverandørene.",
    url: "#",
    validFrom: "2026-09-01T00:00:00Z",
    validUntil: "2026-10-01T21:59:59Z",
    lastChecked: "2026-09-28",
    reviewAfterDays: 1,
  };
  return (
    <>
      <div className="neutral-note">
        Internt designutkast. Tilbudseksemplene nedenfor kan ikke brukes eller
        bestilles. Denne siden er utelatt fra søkemotorindeksering og sitemap.
      </div>
      <div className="prose">
        <h2>Foreslått familie med Middagen.no</h2>
        <p>
          Felles typografi, ikonfamilie, knappestørrelser og avstandslogikk.
          Middagskasser får blå aksent og tydelige tabeller. Middagen kan få
          varmere aksent og mer plass til matfoto. Den eksisterende
          Middagen.no-siden lot seg ikke åpne ved kontroll, så slektskapet er et
          forslag.
        </p>
        <div className="two-up">
          <article>
            <Brand />
            <p>Beslutning og sammenligning</p>
          </article>
          <article>
            <Brand sibling />
            <p>Inspirasjon og middagsvalg</p>
          </article>
        </div>
        <div className="design-swatches">
          {["#182b2b", "#304dcc", "#fbfaf7", "#efc667"].map((c) => (
            <div
              className="design-swatch"
              style={{
                background: c,
                color: c === "#182b2b" || c === "#304dcc" ? "white" : "#182b2b",
              }}
              key={c}
            >
              {c}
            </div>
          ))}
        </div>
        <h2>Tilbudstilstander</h2>
        <OfferBox
          name="leverandøren"
          offer={example}
          demo
          now={new Date("2026-09-28T12:00:00Z")}
        />
        <OfferBox
          name="leverandøren"
          offer={example}
          demo
          now={new Date("2026-10-02T12:00:00Z")}
        />
        <OfferBox name="leverandøren" offer={null} />
        <h2>Skjermer i prototypen</h2>
        <ul>
          <li>
            <Link href="/">Forside, header, footer og søsterlenke</Link>
          </li>
          <li>
            <Link href="/hellofresh-vs-godtlevert">
              Direkte sammenligning, desktop og mobil
            </Link>
          </li>
          <li>
            <Link href="/finn-matkasse">
              Velgersteg og begrunnede resultater
            </Link>
          </li>
          <li>
            <Link href="/godtlevert">Godtlevert-side</Link> og{" "}
            <Link href="/hellofresh">HelloFresh-side</Link>
          </li>
          <li>
            <Link href="/slik-sammenligner-vi">Metode</Link> og{" "}
            <Link href="/annonselenker">affiliateinformasjon</Link>
          </li>
          <li>
            <Link href="/siden-finnes-ikke">404-tilstand</Link>
          </li>
        </ul>
        <h2>Foto</h2>
        <p>
          Illustrasjonsfoto av Valeria Boltneva via{" "}
          <a href="https://www.pexels.com/photo/salmon-dish-with-vegetables-1516415/">
            Pexels
          </a>
          , brukt under{" "}
          <a href="https://www.pexels.com/license/">Pexels-lisensen</a>. Fotoet
          er ikke knyttet til noen matkasseleverandør.
        </p>
      </div>
    </>
  );
}
