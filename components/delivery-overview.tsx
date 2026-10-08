import Link from "next/link";
import { PageIntro } from "./chrome";
import {
  formatDate,
  formatPrice,
  listJoin,
  numberWord,
  readOptional,
} from "@/lib/data";
import { places, checkers, checkerNotes, deliveryChecks } from "@/lib/delivery";
import {
  cellLabel,
  cellView,
  contrasts,
  coverageProviders,
  feeFresh,
  findCheck,
  placesByRegion,
  providerCoverage,
  type CellKind,
} from "@/lib/coverage";
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
function Status({ kind }: { kind: CellKind }) {
  return (
    <span className={`dl-status dl-${kind}`}>
      <span className="dl-mark" aria-hidden="true" />
      {cellLabel[kind]}
    </span>
  );
}
export function DeliveryOverview() {
  const now = new Date();
  const ps = coverageProviders();
  const coverage = ps.map((p) => ({ p, c: providerCoverage(p, now) }));
  const fresh = coverage.some((x) => x.c.checked > 0);
  const latest = coverage
    .map((x) => x.c.checkedAt)
    .filter((d): d is string => d !== null)
    .sort()
    .at(-1);
  const { differ, none } = contrasts(now);
  const withDays = ps.filter((p) =>
    deliveryChecks.some((c) => c.provider === p.id && c.days),
  );
  const withoutDays = ps.filter((p) => !withDays.includes(p));
  return (
    <div className="container page-content">
      <PageIntro eyebrow="LEVERING" title="Hvor leverer matkassene?">
        <p>
          Vi har sjekket {places.length} postnumre fra Kristiansand til Kirkenes
          hos {listJoin(ps.map((p) => p.name))}
          {latest ? `, sist ${formatDate(latest)}` : ""}. For hvert postnummer
          står svaret fra leverandørens egen leveringssjekk.
        </p>
        <p>
          Svaret gjelder det postnummeret, ikke hele kommunen, og leverandørene
          endrer dekningen over tid. Sjekk derfor alltid adressen hos
          leverandøren før dere bestiller.
        </p>
      </PageIntro>
      <div className="prose">
        {fresh ? (
          <ul>
            {coverage
              .filter((x) => x.c.checked > 0)
              .map(({ p, c }) => (
                <li key={p.id}>
                  <Link href={`/${p.id}`}>{p.name}</Link> leverte til{" "}
                  {c.delivers} av de {c.checked} postnumrene
                  {c.addressRequired
                    ? `. For ${numberWord(c.addressRequired)} ba leveringssjekken om full adresse`
                    : ""}
                  .
                </li>
              ))}
            {differ.length > 0 && (
              <li>
                Svarene var ulike i {listJoin(differ)}.
                {none.length > 0 &&
                  ` Ingen av de tre leverte til ${listJoin(
                    none.map((x) => `postnummer ${x.postcode} i ${x.place}`),
                  )}.`}
              </li>
            )}
          </ul>
        ) : (
          <p className="neutral-note">
            Svarene er eldre enn vi viser. De må kontrolleres på nytt, så bruk
            leverandørenes egne sjekker nederst på siden.
          </p>
        )}
      </div>
      <section className="dl-section" aria-labelledby="dl-title">
        <h2 id="dl-title">Svar for hvert postnummer</h2>
        <p className="dl-legend">
          <Status kind="delivers" />: sjekken svarte at de leverer ·{" "}
          <Status kind="no-delivery" />: sjekken svarte at de ikke leverer ·{" "}
          <Status kind="address-required" />: sjekken ba om full adresse.
        </p>
        <p className="dl-legend">
          {withDays.length > 0 &&
            `Ukedager og tidsvinduer er slik ${listJoin(withDays.map((p) => p.name))} viste dem. `}
          {withoutDays.length > 0 &&
            `${listJoin(withoutDays.map((p) => p.name))} viser leveringsdager først etter at dere har laget konto, så der står bare ja eller nei.`}
        </p>
        {placesByRegion().map((g) => (
          <div key={g.region} className="dl-region">
            <h3>{g.region}</h3>
            <table className="dl-table">
              <caption className="visually-hidden">
                Svar fra leveringssjekkene, {g.region}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Sted og postnummer</th>
                  {ps.map((p) => (
                    <th scope="col" key={p.id}>
                      <Link href={`/${p.id}`}>{p.name}</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {g.places.map((pl) => {
                  const cells = ps.map((p) => ({
                    p,
                    v: cellView(findCheck(p.id, pl.postcode), now),
                  }));
                  const dates = [
                    ...new Set(
                      cells
                        .map((x) => x.v.checkedAt)
                        .filter((d): d is string => d !== null),
                    ),
                  ].sort();
                  return (
                    <tr key={pl.postcode}>
                      <th scope="row">
                        {pl.place} · {pl.postcode}
                        {dates.length > 0 && (
                          <small>
                            Kontrollert {listJoin(dates.map(formatDate))}
                          </small>
                        )}
                      </th>
                      {cells.map(({ p, v }) => (
                        <td key={p.id} className={`dl-cell-${v.kind}`}>
                          <span className="dl-provider">{p.name}</span>
                          <span className="dl-answer">
                            <Status kind={v.kind} />
                            {v.days && <small>{v.days}</small>}
                            {(v.kind === "stale" || v.kind === "missing") && (
                              <small>
                                <a
                                  href={checkers[p.id].url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Sjekk hos {p.name}
                                </a>
                              </small>
                            )}
                          </span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </section>
      <div className="prose">
        <h2>Frakt</h2>
        <ul>
          {ps.map((p) => {
            const own = deliveryChecks.filter(
              (c) =>
                c.provider === p.id &&
                c.status === "delivers" &&
                cellView(c, now).kind === "delivers",
            );
            const shown = own.filter((c) => feeFresh(c, now));
            const basis = shown[0]?.feeBasis;
            const fee = shown[0]?.fee;
            const slots = /leveringstidspunkt/i.test(
              readOptional(p.surcharge, now) ?? "",
            );
            return (
              <li key={p.id}>
                <strong>{p.name}:</strong>{" "}
                {!shown.length || fee == null
                  ? "Frakten må kontrolleres på nytt."
                  : basis === "observed"
                    ? `${formatPrice(fee)} i ${p.id === "kokkeloren" ? "bestillingen" : "planvalget"} for ${
                        shown.length === own.length
                          ? `alle ${shown.length} postnumrene der de leverte`
                          : `de ${shown.length} postnumrene vi så frakten for`
                      }.${shown[0].note ? ` ${shown[0].note}` : ""}${
                        slots
                          ? " Enkelte leveringstidspunkter koster ekstra, og tillegget endrer seg fra uke til uke."
                          : ""
                      }`
                    : basis === "stated-standard"
                      ? `Leveringssjekken viser ikke frakt. ${p.name} oppgir ${formatPrice(fee)} som standardfrakt, men frakten for en bestemt adresse ser dere først når dere har laget konto.`
                      : "Frakten vises ikke uten konto."}
              </li>
            );
          })}
        </ul>
        <h2>Bor dere et annet sted?</h2>
        <p>
          Andre postnumre har vi ikke sjekket, og vi gjetter ikke ut fra
          nabosteder. Alle tre har en egen leveringssjekk:
        </p>
        <ul>
          {ps.map((p) => (
            <li key={p.id}>
              <a
                href={checkers[p.id].url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {p.name}
              </a>
              : {checkerNotes[p.id]}
            </li>
          ))}
        </ul>
        <p>Lenkene går rett til leverandørene og er ikke annonselenker.</p>
        <h2>Slik har vi sjekket</h2>
        <p>
          Vi skrev bare inn postnummeret i hver leverandørs offentlige
          leveringssjekk, uten konto og uten adresse, og noterte svaret.
          Postnumrene er valgt for å dekke både store byer og mindre steder i
          alle landsdeler. Vi sjekker dem på nytt hvert kvartal, og svar som er
          eldre enn 120 dager, vises ikke.{" "}
          <Link href="/slik-sammenligner-vi">Slik sammenligner vi</Link>
        </p>
        <p>
          {cap(numberWord(ps.length))} matkasser med råvarer og oppskrift er med
          her. Hva som skiller dem, står på{" "}
          <Link href="/beste-matkasse">Beste matkasse for ulike behov</Link> og{" "}
          <Link href="/matkasser">Matkasser i Norge</Link>.
        </p>
      </div>
    </div>
  );
}
