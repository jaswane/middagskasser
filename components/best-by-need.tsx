import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageIntro } from "./chrome";
import { PriceExamples } from "./market-overview";
import {
  formatDate,
  formatPrice,
  numberWord,
  readFact,
  getQuote,
  editorialProviders,
  type Provider,
  type ProviderSlug,
} from "@/lib/data";
import { bestByNeed, type Mark } from "@/lib/best";
import { market } from "@/lib/market";
// The smallest box each råvarekasse sells, from fresh data only.
function smallestBoxes(kits: Provider<ProviderSlug>[]) {
  return kits.map((p) => {
    const people = readFact(p.people),
      meals = readFact(p.meals);
    const q = people && meals ? getQuote(p, people[0], meals[0]) : null;
    return {
      provider: p,
      people: people?.[0] ?? null,
      meals: meals?.[0] ?? null,
      total: q && q.deliveryFee !== null ? q.boxPrice + q.deliveryFee : null,
    };
  });
}
function OnePerson({ kits }: { kits: Provider<ProviderSlug>[] }) {
  const boxes = smallestBoxes(kits);
  if (boxes.some((b) => b.people === null || b.people < 2)) return null;
  const priced = boxes.filter((b) => b.total !== null && b.meals === 2);
  const fixed = boxes.filter((b) => b.provider.tier === "editorial");
  const fit = market.find((m) => m.id === "fitme");
  return (
    <>
      <h2>Matkasse for én person</h2>
      <p>
        Ingen av de tre råvarekassene har en kasse for én porsjon. Den minste
        kassen er for to porsjoner
        {priced.length > 0 ? " og to middager." : "."}
        {priced.length > 0 &&
          ` Med frakt koster den ${priced
            .map(
              (b, i) =>
                `${formatPrice(b.total!)}${i === 0 ? " i uken" : ""} hos ${b.provider.name}`,
            )
            .join(" og ")}.`}
        {fixed.map((b) => (
          <span key={b.provider.id}>
            {" "}
            {b.provider.name}s minste kasse er for to voksne og{" "}
            {numberWord(b.meals!)} middager.
          </span>
        ))}
      </p>
      <p>
        En kasse for to gir to porsjoner av hver middag. Om den andre porsjonen
        passer som middag dagen etter, må du vurdere selv. Vi har ikke undersøkt
        hvordan rettene holder seg.
      </p>
      {fit && (
        <p>
          Vil du heller ha ferdige enkeltmåltider, selger {fit.name} det fra 109
          kr per måltid, men leverer bare i Bergen (kontrollert{" "}
          {formatDate(fit.checkedAt)}).{" "}
          <Link href={`/matkasser#${fit.id}`}>Se {fit.name} i oversikten</Link>.
        </p>
      )}
    </>
  );
}
const markText: Record<Mark, string> = {
  best: "Peker seg ut",
  yes: "Ja",
  no: "Nei",
};
function MarkLabel({ mark }: { mark: Mark }) {
  return (
    <span className={`need-mark need-mark-${mark}`}>
      <span className="need-dot" aria-hidden="true" />
      {markText[mark]}
    </span>
  );
}
export function BestByNeed() {
  const b = bestByNeed();
  const { gl, hf, kits, tally, rows } = b;
  const k = editorialProviders[0];
  const priceRow = rows.find((r) => r.id === "pris");
  const sizeRow = rows.find((r) => r.id === "storrelse");
  const glCount = b.counts[gl.id],
    hfCount = b.counts[hf.id];
  const kPremium = b.premium.find((x) => x.provider.id === k?.id);
  // The picks below rest on these rows; without them we show no advice.
  const ready = ["pris", "storrelse", "utvalg", "fast-meny"].every((id) =>
    rows.some((r) => r.id === id),
  );
  const glSizes = readFact(gl.people) ?? [];
  return (
    <div className="container page-content">
      <PageIntro
        eyebrow="BESTE VALG ETTER BEHOV"
        title="Beste matkasse for ulike behov"
      >
        <p>
          Ingen matkasse er best for alle. Hvilken som passer, avhenger mest av
          hvor mange dere er, hvor mye dere vil velge selv og hva dere vil
          betale.
        </p>
        {ready && (
          <ul className="best-answer">
            {sizeRow?.cells[gl.id].mark === "best" && (
              <li>
                <strong>Godtlevert</strong> er den eneste av de tre med kasser
                for {sizeRow.need.toLowerCase()}
                {glCount && hfCount && glCount > hfCount
                  ? ", og oppgir flest retter å velge mellom."
                  : "."}
              </li>
            )}
            {priceRow?.cells[hf.id].mark === "best" && (
              <li>
                <strong>HelloFresh</strong> var billigere enn Godtlevert i{" "}
                {numberWord(tally.aWins)} av {numberWord(tally.total)} like
                kassestørrelser, med frakt.
              </li>
            )}
            {k && b.fixed.includes(k) && (
              <li>
                <strong>{k.name}</strong> passer for dere som vil slippe å velge
                retter
                {kPremium ? ", men koster mer." : "."}
              </li>
            )}
          </ul>
        )}
        <p>
          Vi har ikke bestilt eller smakt matkassene. Vurderingen bygger på
          priser, kassestørrelser, utvalg, levering og vilkår som vi har
          kontrollert hos leverandørene
          {b.checkedAt ? `, sist ${formatDate(b.checkedAt)}` : ""}.
        </p>
      </PageIntro>
      {!ready ? (
        <div className="prose">
          <p className="neutral-note">
            Flere av opplysningene vurderingen bygger på, må kontrolleres på
            nytt. Til det er gjort, viser vi ingen anbefaling her.
          </p>
          <NextSteps />
        </div>
      ) : (
        <>
          <section className="need-section" aria-labelledby="need-title">
            <h2 id="need-title">Hvem peker seg ut for hvilket behov?</h2>
            <p className="need-legend">
              <MarkLabel mark="best" /> har en dokumentert fordel ·{" "}
              <MarkLabel mark="yes" /> tilbyr det · <MarkLabel mark="no" />{" "}
              tilbyr det ikke
            </p>
            <table className="need-matrix">
              <caption className="visually-hidden">
                Behov og matkasser. Hver celle sier om matkassen peker seg ut,
                tilbyr det eller ikke tilbyr det, og hvorfor.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Behov</th>
                  {kits.map((p) => (
                    <th scope="col" key={p.id}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <th scope="row">
                      {r.need}
                      {r.note && <small>{r.note}</small>}
                    </th>
                    {kits.map((p) => (
                      <td
                        key={p.id}
                        className={`need-cell-${r.cells[p.id].mark}`}
                      >
                        <span className="need-provider">{p.name}</span>
                        <MarkLabel mark={r.cells[p.id].mark} />
                        <small>{r.cells[p.id].detail}</small>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="need-footnote">
              {priceRow &&
                `Pris: ordinær ukepris med frakt i de ${numberWord(tally.total)} kassestørrelsene HelloFresh og Godtlevert begge tilbyr${tally.ties ? `, der ${numberWord(tally.ties)} hadde lik pris` : ""}. ${k ? `${k.name} kan bare sammenlignes i ${numberWord(b.shared.length)} av dem.` : ""} `}
              Utvalg er leverandørenes egne tall, ikke noe vi har telt.
              Rekkefølgen er alfabetisk.
            </p>
          </section>
          <div className="prose">
            <h2>Hva passer dere?</h2>
            <article className="best-pick">
              <h3>Velg Godtlevert hvis dere er tre, fem eller seks</h3>
              <p>
                <strong>Hvorfor:</strong> Godtlevert har kasser for{" "}
                {numberWord(glSizes[0])} til{" "}
                {numberWord(glSizes[glSizes.length - 1])} porsjoner. HelloFresh
                {k ? ` og ${k.name}` : ""} har bare kasser for to eller fire.
                {glCount && hfCount
                  ? ` Godtlevert oppgir også ${glCount} retter å velge mellom i uken, mot ${hfCount} hos HelloFresh.`
                  : ""}
              </p>
              <p>
                <strong>Viktigste begrensning:</strong> {gl.limitations[0]}
              </p>
              <p>
                <strong>Alternativ:</strong>{" "}
                {tally.total > 0 && tally.aWins > tally.bWins
                  ? `Er dere to eller fire, var HelloFresh billigere i ${numberWord(tally.aWins)} av ${numberWord(tally.total)} like kassestørrelser.`
                  : "Er dere to eller fire, kan HelloFresh også være aktuell."}
              </p>
              <p>
                <Link className="text-link" href="/godtlevert">
                  Les om Godtlevert <ArrowRight size={15} />
                </Link>
              </p>
            </article>
            <article className="best-pick">
              <h3>
                Velg HelloFresh hvis dere er to eller fire og prisen teller
              </h3>
              <p>
                <strong>Hvorfor:</strong>{" "}
                {tally.total > 0
                  ? `Med oppgitt frakt var HelloFresh billigst i ${numberWord(tally.aWins)} av de ${numberWord(tally.total)} kassestørrelsene begge tilbyr. `
                  : ""}
                Menyen skifter hver uke, og dere velger rettene selv.
              </p>
              <p>
                <strong>Viktigste begrensning:</strong> {hf.limitations[0]}
              </p>
              <p>
                <strong>Alternativ:</strong> Godtlevert, hvis dere trenger en
                annen størrelse eller vil ha flere retter å velge mellom.
              </p>
              <p>
                <Link className="text-link" href="/hellofresh">
                  Les om HelloFresh <ArrowRight size={15} />
                </Link>
              </p>
            </article>
            {k && (
              <article className="best-pick">
                <h3>Vurder {k.name} hvis dere vil slippe å velge retter</h3>
                <p>
                  <strong>Hvorfor:</strong> {k.editorial.difference}{" "}
                  {readFact(k.flexibility)}
                </p>
                <p>
                  <strong>Viktigste begrensning:</strong>{" "}
                  {k.editorial.limitation}
                  {kPremium
                    ? ` I størrelsene vi kan sammenligne, koster den ${kPremium.min === kPremium.max ? formatPrice(kPremium.min) : `${formatPrice(kPremium.min).replace(" kr", "")}–${formatPrice(kPremium.max)}`} mer i uken enn det billigste alternativet.`
                    : ""}
                </p>
                <p>
                  <strong>Alternativ:</strong> {k.editorial.alternative}
                </p>
                <p>
                  <Link className="text-link" href={`/${k.id}`}>
                    Les om {k.name} <ArrowRight size={15} />
                  </Link>
                </p>
              </article>
            )}
            <OnePerson kits={kits} />
            <PriceExamples />
            <p>
              Priser for alle kassestørrelser står på sidene om{" "}
              <Link href="/godtlevert">Godtlevert</Link> og{" "}
              <Link href="/hellofresh">HelloFresh</Link>.
            </p>
            <h2>Slik har vi vurdert</h2>
            <p>
              Alle tre er vurdert etter de samme opplysningene: kassestørrelser,
              antall middager, ordinær pris og frakt, oppgitt utvalg, levering
              og vilkår. At en matkasse peker seg ut, betyr at den har en
              dokumentert fordel for akkurat det behovet. Det sier ingenting om
              smak eller råvarekvalitet, som vi ikke har undersøkt.
            </p>
            <p>
              Lenker til HelloFresh og Godtlevert kan være annonselenker. Med{" "}
              {k?.name ?? "Kokkeløren"} har vi ingen avtale. Ingen av delene
              påvirker hvem som peker seg ut, og priser eldre enn 30 dager tas
              ut av vurderingen til de er kontrollert igjen.{" "}
              <Link href="/slik-sammenligner-vi">Slik sammenligner vi</Link> ·{" "}
              <Link href="/annonselenker">Om annonselenker</Link>
            </p>
            <NextSteps />
          </div>
        </>
      )}
    </div>
  );
}
function NextSteps() {
  return (
    <>
      <h2>Finn matkassen for deres husholdning</h2>
      <p>
        Matkassevelgeren sammenligner HelloFresh og Godtlevert ut fra hvor mange
        dere er, hvor mange middager dere trenger og hva som betyr mest.
        Markedsoversikten viser også ferdigmat og treningsmåltider.
      </p>
      <div className="best-actions">
        <Link className="button button-primary" href="/finn-matkasse">
          Finn matkassen som passer oss <ArrowRight size={18} />
        </Link>
        <Link className="button button-outline" href="/matkasser">
          Se alle matkasser
        </Link>
      </div>
    </>
  );
}
