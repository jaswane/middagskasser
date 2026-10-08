import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageIntro } from "./chrome";
import {
  formatDate,
  formatPrice,
  formatServing,
  listJoin,
  numberWord,
  readOptional,
  freshDeliverySamples,
} from "@/lib/data";
import { cheapest, type Priced } from "@/lib/cheapest";
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const size = (x: Priced) => `${x.quote.people} × ${x.quote.meals}`;
const sizeWords = (x: Priced) =>
  `${numberWord(x.quote.people)} porsjoner og ${numberWord(x.quote.meals)} middager`;
export function CheapestGuide() {
  const c = cheapest();
  const lt = c.lowestTotal,
    lp = c.lowestPerPortion;
  const date = c.dates.length ? listJoin(c.dates.map(formatDate)) : null;
  if (!lt || !lp || !date)
    return (
      <div className="container page-content">
        <PageIntro
          eyebrow="ORDINÆR PRIS, UTEN KAMPANJE"
          title="Billigste matkasse – hva koster alternativene?"
        >
          <p>
            Prisene må kontrolleres på nytt. Til det er gjort, viser vi ingen
            sammenligning her.
          </p>
        </PageIntro>
        <div className="prose">
          <p>
            <Link href="/matkasser">Se alle matkassene vi har kontrollert</Link>
          </p>
        </div>
      </div>
    );
  const observed = [
    ...new Set(
      c.all
        .filter((x) => x.quote.basis === "observed-checkout")
        .map((x) => x.provider),
    ),
  ];
  const standard = [
    ...new Set(
      c.all
        .filter((x) => x.quote.basis === "calculated-standard")
        .map((x) => x.provider),
    ),
  ];
  const postcodes = observed.length
    ? freshDeliverySamples(observed[0])
        .map((s) => s.postcode)
        .filter((code) =>
          observed.every((p) =>
            freshDeliverySamples(p).some(
              (s) => s.postcode === code && s.fee !== null,
            ),
          ),
        )
    : [];
  const surcharge = c.kits.filter((p) => readOptional(p.surcharge));
  const slotSurcharge = c.kits.filter((p) =>
    /leveringstidspunkt/i.test(readOptional(p.surcharge) ?? ""),
  );
  const ltProvider = c.perProvider.find(
    (x) => x.provider.id === lt.provider.id,
  );
  const shared = c.bySize.filter((s) => s.offering.length > 1);
  const single = c.bySize.filter((s) => s.offering.length === 1);
  const fixedUnit = c.kits.find((p) => p.tier === "editorial");
  return (
    <div className="container page-content">
      <PageIntro
        eyebrow="ORDINÆR PRIS, UTEN KAMPANJE"
        title="Billigste matkasse – hva koster alternativene?"
      >
        <p>
          Det kommer an på hva dere mener med billigst. Lavest ukepris har{" "}
          {lt.provider.name}: {formatPrice(lt.total)} for {sizeWords(lt)}, med
          frakt. Lavest pris per porsjon har {lp.provider.name}:{" "}
          {formatServing(lp.perPortion)} med {sizeWords(lp)}, som blir{" "}
          {formatPrice(lp.total)} i uken.
        </p>
        <p>
          {lt.portions === Math.min(...c.all.map((x) => x.portions)) &&
            lp.portions === Math.max(...c.all.map((x) => x.portions)) &&
            "Den ene er den minste kassen, den andre den største, så de svarer på ulike spørsmål. "}
          Alle tall er ordinær pris med frakt, uten introtilbud.
          {standard.length > 0 &&
            ` For ${listJoin(standard.map((p) => p.name))} er det oppgitt standardfrakt, ikke frakt for en bestemt adresse.`}{" "}
          Pris kontrollert {date}.
        </p>
      </PageIntro>
      <div className="prose">
        <h2>Lavest pris per uke</h2>
        <p>
          Laveste ukepris får dere med den minste kassen. Det er den billigste
          uken, men også den minste mengden mat.
        </p>
        <table className="cheap-table">
          <caption className="visually-hidden">
            Laveste ukepris hos hver matkasse, med frakt
          </caption>
          <thead>
            <tr>
              <th scope="col">Matkasse</th>
              <th scope="col">Porsjoner × middager</th>
              <th scope="col">Ukepris</th>
            </tr>
          </thead>
          <tbody>
            {c.perProvider.map(({ provider, lowestTotal: x }) => (
              <tr key={provider.id}>
                <th scope="row">{provider.name}</th>
                <td>{size(x!)}</td>
                <td className={x === lt ? "cheap-best" : undefined}>
                  {formatPrice(x!.total)}
                  {x === lt && (
                    <span className="visually-hidden"> (lavest)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2>Lavest pris per porsjon</h2>
        <p>
          Pris per porsjon er ukeprisen med frakt delt på antall porsjoner. Den
          blir lavest i den største kassen, fordi frakten fordeles på flere
          porsjoner og store kasser koster mindre per porsjon enn små.
          {lp.portions > 0 &&
            ` ${lp.provider.name}s laveste porsjonspris forutsetter at dere bruker ${lp.portions} porsjoner i uken.`}
        </p>
        <table className="cheap-table">
          <caption className="visually-hidden">
            Laveste pris per porsjon hos hver matkasse, med frakt
          </caption>
          <thead>
            <tr>
              <th scope="col">Matkasse</th>
              <th scope="col">Porsjoner × middager</th>
              <th scope="col">Ukepris</th>
              <th scope="col">Per porsjon</th>
            </tr>
          </thead>
          <tbody>
            {c.perProvider.map(({ provider, lowestPerPortion: x }) => (
              <tr key={provider.id}>
                <th scope="row">{provider.name}</th>
                <td>{size(x!)}</td>
                <td>{formatPrice(x!.total)}</td>
                <td className={x === lp ? "cheap-best" : undefined}>
                  {formatServing(x!.perPortion)}
                  {x === lp && (
                    <span className="visually-hidden"> (lavest)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2>Pris etter hvor mange dere er</h2>
        <p>
          Tabellene viser ukepris med frakt. Der flere matkasser har samme
          størrelse, er den laveste prisen for hvert antall middager uthevet.
        </p>
        <div className="cheap-sizes">
          {shared.map((s) => (
            <table className="cheap-table" key={s.people}>
              <caption>{cap(numberWord(s.people))} porsjoner</caption>
              <thead>
                <tr>
                  <th scope="col">Middager</th>
                  {s.offering.map((p) => (
                    <th scope="col" key={p.id}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.rows.map((r) => (
                  <tr key={r.meals}>
                    <th scope="row">{r.meals}</th>
                    {r.cells.map((cell, i) => (
                      <td
                        key={s.offering[i].id}
                        className={cell.cheapest ? "cheap-best" : undefined}
                      >
                        {cell.priced ? formatPrice(cell.priced.total) : "–"}
                        {cell.cheapest && (
                          <span className="visually-hidden"> (lavest)</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
        {single.length > 0 && (
          <ul>
            {single.map((s) => (
              <li key={s.people}>
                <strong>{cap(numberWord(s.people))} porsjoner:</strong> bare{" "}
                {s.offering[0].name}, {formatPrice(s.min).replace(" kr", "")}–
                {formatPrice(s.max)} i uken for {numberWord(s.rows[0].meals)}{" "}
                til {numberWord(s.rows[s.rows.length - 1].meals)} middager.
              </li>
            ))}
          </ul>
        )}
        <p className="neutral-note">
          {fixedUnit &&
            `${fixedUnit.name} har alltid tre middager. Kassene for to og fire voksne er regnet som to og fire porsjoner. Kassen for to voksne og to små barn er ikke med, fordi ${fixedUnit.name} ikke oppgir hvor mange porsjoner den gir. `}
          Alle priser for hver leverandør står på sidene om{" "}
          {c.kits.map((p, i) => (
            <span key={p.id}>
              {i > 0 && (i === c.kits.length - 1 ? " og " : ", ")}
              <Link href={`/${p.id}`}>{p.name}</Link>
            </span>
          ))}
          .
        </p>
        <h2>Introtilbud er ikke med</h2>
        <p>
          Sammenligningen bruker ordinær pris, altså det kassen koster når
          eventuelle velkomstrabatter er brukt opp. Et introtilbud kan gjøre de
          første leveringene billigere, men vi bruker det ikke til å avgjøre
          hvem som er billigst. Vi viser ingen kampanjetall her, fordi vi ikke
          har kontrollerte tilbudsvilkår.
        </p>
        <h2>Dette kan endre prisen</h2>
        <ul>
          <li>
            <strong>Frakt:</strong>{" "}
            {observed.length > 0 && postcodes.length > 0 && (
              <>
                {listJoin(observed.map((p) => p.name))} viste{" "}
                {formatPrice(
                  c.all.find((x) => x.provider.id === observed[0].id)!.quote
                    .deliveryFee!,
                )}{" "}
                i frakt for postnummer {listJoin(postcodes)}.{" "}
              </>
            )}
            {standard.length > 0 &&
              `${listJoin(standard.map((p) => p.name))} viser frakten for en adresse først når dere har laget konto, så her står den oppgitte standardfrakten.`}
          </li>
          {slotSurcharge.length > 0 && (
            <li>
              <strong>Leveringstidspunkt:</strong>{" "}
              {listJoin(slotSurcharge.map((p) => p.name))} tar ekstra for
              enkelte leveringstidspunkter, og tillegget endrer seg fra uke til
              uke.
            </li>
          )}
          {surcharge.length > 0 && (
            <li>
              <strong>Dyrere retter:</strong> Hos{" "}
              {listJoin(surcharge.map((p) => p.name))} koster enkelte retter
              ekstra.
            </li>
          )}
          {ltProvider?.lowestPerPortion && (
            <li>
              <strong>Størrelse og antall middager:</strong> Hos{" "}
              {lt.provider.name} går prisen per porsjon fra{" "}
              {formatServing(lt.perPortion)} ({size(lt)}) til{" "}
              {formatServing(ltProvider.lowestPerPortion.perPortion)} (
              {size(ltProvider.lowestPerPortion)}).
            </li>
          )}
        </ul>
        <h2>Slik har vi kontrollert prisene</h2>
        <p>
          Pris kontrollert {date} i leverandørenes egne bestillingsløp, uten
          rabattkode.
          {c.unchanged.length > 0 &&
            c.earlier.length > 0 &&
            ` For ${listJoin([
              ...new Set(c.unchanged.map((x) => x.provider.name)),
            ])} var prisene for ${listJoin(
              [...new Set(c.unchanged.map((x) => x.quote.people))]
                .sort((a, b) => a - b)
                .map(numberWord),
            )} porsjoner de samme ved forrige kontroll ${listJoin(c.earlier.map(formatDate))}.`}{" "}
          Priser som er eldre enn 30 dager, tas ut av siden til de er
          kontrollert igjen.{" "}
          <Link href="/slik-sammenligner-vi">Slik sammenligner vi</Link>
        </p>
        <p>
          <Link className="text-link" href="/beste-matkasse">
            Pris er ikke alt: se hvilken matkasse som passer ulike behov{" "}
            <ArrowRight size={15} />
          </Link>
        </p>
      </div>
    </div>
  );
}
