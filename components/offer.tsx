import { activeOffer, formatDate, type Offer } from "@/lib/data";
export function OfferBox({
  offer,
  name,
  demo = false,
  now = new Date(),
}: {
  offer: Offer | null;
  name: string;
  demo?: boolean;
  now?: Date;
}) {
  const active = activeOffer(offer, now);
  return (
    <aside className={`offer-box ${active ? "active" : ""}`}>
      {demo && <span className="badge">Designdemo · ikke et reelt tilbud</span>}
      <div className="eyebrow">
        {active ? "INTRODUKSJONSTILBUD" : "TILBUD OG NORMALPRIS"}
      </div>
      <h3>
        {active
          ? active.headline
          : offer
            ? "Dette tilbudet er utløpt"
            : "Ingen verifisert kampanje å vise"}
      </h3>
      <p>
        {active
          ? active.description
          : "Sammenlign den ordinære prisen først. Leverandøren kan ha tilbud som vi ennå ikke har kontrollert."}
      </p>
      {active && (
        <>
          <p>
            Gjelder til {formatDate(active.validUntil.slice(0, 10))}.
            Kontrollert {formatDate(active.lastChecked)}.
          </p>
          {active.code && (
            <p>
              Kode: <strong>{active.code}</strong>
            </p>
          )}
          {demo ? (
            <button disabled className="button button-outline">
              Se tilbud hos {name} ↗
            </button>
          ) : (
            <a
              href={active.url}
              className="button button-outline"
              rel="sponsored nofollow"
            >
              Se tilbud hos {name} ↗
            </a>
          )}
        </>
      )}
    </aside>
  );
}
