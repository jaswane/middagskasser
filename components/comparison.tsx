"use client";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Plus, Minus, Info } from "lucide-react";
import {
  providers,
  getQuote,
  readFact,
  formatDate,
  formatPrice,
  formatServing,
  type ProviderId,
} from "@/lib/data";
import { Outbound } from "./outbound";
import { track } from "./analytics";
import { AffiliateDisclosure } from "./affiliate-disclosure";
export function ProviderName({ id, name }: { id: string; name: string }) {
  return (
    <span className={`provider-name ${id}`}>
      <Image
        className="provider-mark"
        src={`/brands/${id === "hellofresh" ? "hellofresh.ico" : "godtlevert-icon.svg"}`}
        width={31}
        height={34}
        alt=""
        aria-hidden="true"
        unoptimized
      />
      {name}
    </span>
  );
}
export function Comparison({
  full = false,
  flags = { godtlevert: false, hellofresh: false },
}: {
  full?: boolean;
  flags?: Record<ProviderId, boolean>;
}) {
  const [people, setPeople] = useState("4"),
    [meals, setMeals] = useState("3"),
    [expanded, setExpanded] = useState(full);
  const ref = useRef<HTMLDivElement>(null);
  const tableId = useId();
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          if (
            track("comparison_view", {
              page: location.pathname,
              placement: "comparison",
            })
          )
            observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);
    const onReady = () => {
      if (ref.current) {
        observer.unobserve(ref.current);
        observer.observe(ref.current);
      }
    };
    document.addEventListener("analytics-ready", onReady);
    return () => {
      observer.disconnect();
      document.removeEventListener("analytics-ready", onReady);
    };
  }, []);
  const rows = [
    {
      label: "Utvalg (leverandøroppgitt)",
      values: providers.map((p) =>
        readFact(p.selectionCount)
          ? readFact(p.selectionCount) + " retter per uke*"
          : "Må kontrolleres",
      ),
    },
    {
      label: "Vegetar",
      values: providers.map((p) => readFact(p.vegetarian) || "Må kontrolleres"),
    },
    {
      label: "Raske middager",
      values: providers.map((p) => readFact(p.quick) || "Må kontrolleres"),
    },
    {
      label: "Pause og endring",
      values: providers.map(
        (p) => readFact(p.flexibility) || "Må kontrolleres",
      ),
    },
  ];
  const extra = [
    {
      label: "Antall personer",
      values: providers.map(
        (p) => readFact(p.people)?.join(", ") || "Må kontrolleres",
      ),
    },
    {
      label: "Middager per uke",
      values: providers.map(
        (p) => readFact(p.meals)?.join(", ") || "Må kontrolleres",
      ),
    },
    {
      label: "Levering",
      values: providers.map((p) => readFact(p.delivery) || "Sjekk postnummer"),
    },
  ];
  return (
    <div ref={ref} className="comparison" id="sammenligning">
      <div className="comparison-settings">
        <div>
          <span className="eyebrow">SAMME STØRRELSE. SAMME KRITERIER.</span>
          <p>Hva skal vi sammenligne?</p>
        </div>
        <div className="selects">
          <label>
            Personer
            <select value={people} onChange={(e) => setPeople(e.target.value)}>
              {[2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <span className="select-times">×</span>
          <label>
            Middager
            <select value={meals} onChange={(e) => setMeals(e.target.value)}>
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <AffiliateDisclosure flags={flags} />
      <div
        className="comparison-table"
        id={tableId}
        role="table"
        aria-label={`Sammenligning for ${people} personer og ${meals} middager`}
      >
        <div className="comparison-row provider-heading" role="row">
          <div className="row-label" role="columnheader">
            To matkasser.
            <br />
            Ditt valg.
          </div>
          {providers.map((p) => (
            <div role="columnheader" key={p.id}>
              <ProviderName id={p.id} name={p.name} />
              <p>
                {readFact(p.people) && readFact(p.selectionCount)
                  ? p.description
                  : "Opplysningene trenger ny kontroll."}
              </p>
            </div>
          ))}
        </div>
        <div className="comparison-row price-row" role="row">
          <div role="rowheader" className="row-label">
            Ordinært priseksempel
            <small>
              {people} personer · {meals} middager
            </small>
          </div>
          {providers.map((p) => {
            const q = getQuote(p, Number(people), Number(meals));
            const sizes = readFact(p.people),
              supported = sizes === null || sizes.includes(Number(people));
            return (
              <div role="cell" key={p.id}>
                {q ? (
                  <>
                    <span className="price">
                      {formatPrice(q.boxPrice + (q.deliveryFee ?? 0))}
                      <small>/ uke</small>
                    </span>
                    <p>
                      {q.deliveryFee === null
                        ? "Frakt kommer i tillegg. Gebyr må sjekkes."
                        : `Inkl. ${q.deliveryFee} kr oppgitt frakt.`}
                    </p>
                    <p>{q.addressNote}</p>
                    <small>
                      {formatServing(
                        (q.boxPrice + (q.deliveryFee ?? 0)) /
                          (q.people * q.meals),
                      )}{" "}
                      / porsjon{q.deliveryFee === null ? " før frakt" : ""}
                    </small>
                    <a
                      className="source-date"
                      href={q.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Pris kontrollert {formatDate(q.source.checkedAt)} ↗
                    </a>
                    <a
                      className="source-date"
                      href={q.deliverySource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Fraktkilde ↗
                    </a>
                  </>
                ) : (
                  <>
                    <strong className="unknown-price">
                      {supported
                        ? "Pris må sjekkes"
                        : "Størrelsen er ikke oppgitt"}
                    </strong>
                    <p>
                      {supported
                        ? "Vi mangler en fersk pris for dette valget."
                        : "Velg en annen kassestørrelse for å sammenligne."}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
        {[...rows, ...(expanded ? extra : [])].map((row) => (
          <div className="comparison-row" role="row" key={row.label}>
            <div role="rowheader" className="row-label">
              {row.label}
            </div>
            {row.values.map((value, i) => (
              <div role="cell" key={i}>
                <span className="cell-value">
                  {row.label === "Vegetar" || row.label === "Raske middager" ? (
                    <Check size={16} aria-hidden="true" />
                  ) : null}
                  {value}
                </span>
              </div>
            ))}
          </div>
        ))}
        <div className="comparison-row actions-row" role="row">
          <div className="row-label" role="rowheader">
            Ta en nærmere titt<small>Les mer før du velger.</small>
          </div>
          {providers.map((p) => (
            <div role="cell" key={p.id}>
              <Link href={`/${p.id}`} className="text-link">
                Om {p.name} <ArrowRight size={15} />
              </Link>
              <Outbound id={p.id} name={p.name} affiliate={flags[p.id]} />
            </div>
          ))}
        </div>
      </div>
      <div className="comparison-bottom">
        <button
          className="expand-button"
          aria-expanded={expanded}
          aria-controls={tableId}
          onClick={() => {
            setExpanded(!expanded);
            track("comparison_expand", {
              section: expanded ? "details_closed" : "details_open",
              page: location.pathname,
            });
          }}
        >
          {expanded ? <Minus size={17} /> : <Plus size={17} />}{" "}
          {expanded ? "Vis færre detaljer" : "Vis alle forskjellene"}
        </button>
        <span>Alfabetisk rekkefølge. Ingen rangering.</span>
      </div>
      <p className="price-note">
        <Info size={16} />
        <span>
          *Utvalg er leverandørens oppgitte tall, kontrollert 28.09.2026. Eldre
          sider oppgir andre tall; vi har ikke telt rettene selv. Prisene
          gjelder ordinær kasse uten introtilbud eller tillegg. Leveringsadresse
          kan påvirke totalen. Manglende eller gamle priser vises ikke som
          gjeldende. <Link href="/slik-sammenligner-vi">Se grunnlaget.</Link>
        </span>
      </p>
    </div>
  );
}
