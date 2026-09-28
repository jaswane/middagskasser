"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { providers, formatDate, type ProviderId } from "@/lib/data";
import { matchProviders, resultTitle, type Answers } from "@/lib/selector";
import { ProviderName } from "./comparison";
import { Outbound } from "./outbound";
import { track } from "./analytics";
import { METHOD_VERSION } from "@/lib/measurement";
import { AffiliateDisclosure } from "./affiliate-disclosure";
const priorities = {
  price: "Lavere normalpris",
  selection: "Flere retter å velge mellom",
  none: "Ingen klar prioritet",
};
export function Selector({ flags }: { flags: Record<ProviderId, boolean> }) {
  const [step, setStep] = useState(0),
    [answers, setAnswers] = useState<Partial<Answers>>({}),
    [started, setStarted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current !== step) heading.current?.focus();
    previousStep.current = step;
  }, [step]);
  function choose(key: keyof Answers, value: number | string) {
    if (!started) {
      track("selector_start", {
        placement: "selector_page",
        page: "/finn-matkasse",
      });
      setStarted(true);
    }
    setAnswers({ ...answers, [key]: value });
    track("selector_answer", { step: key, answer_id: value });
  }
  function next() {
    if (step === 2) {
      const matches = matchProviders(providers, answers as Answers);
      track("selector_complete", {
        method_version: METHOD_VERSION,
        result_type:
          matches.find((m) => m.score > 0)?.provider.id ||
          (matches.filter((m) => m.compatible === true).length === 1
            ? matches.find((m) => m.compatible === true)!.provider.id
            : matches.every((m) => m.compatible === false)
              ? "no_match"
              : "shared_or_uncertain"),
      });
    }
    setStep(step + 1);
  }
  const titles = [
    "Hvor mange porsjoner trenger dere?",
    "Hvor mange middager i uken?",
    "Hva betyr mest for dere?",
  ];
  const descriptions = [
    "Velg antall porsjoner per middag. Behovet kan variere med alder og appetitt.",
    "Vi sammenligner samme antall middager hos begge.",
    "Vi bruker bare forskjeller vi kan dokumentere.",
  ];
  const key = (["people", "meals", "priority"] as const)[step];
  if (step === 3) {
    const matches = matchProviders(providers, answers as Answers);
    return (
      <div>
        <span className="eyebrow">DERES UTGANGSPUNKT</span>
        <h2 ref={heading} tabIndex={-1}>
          {resultTitle(matches, answers as Answers)}
        </h2>
        <p className="result-context">
          {answers.people === 7 ? "7+" : answers.people} porsjoner ·{" "}
          {answers.meals} middager · {priorities[answers.priority!]}
        </p>
        <p className="neutral-note">
          Dette er en sammenligning av Godtlevert og HelloFresh. Levering må
          sjekkes for adressen deres. Ingen av resultatene er en
          kvalitetsrangering.
        </p>
        <AffiliateDisclosure flags={flags} />
        {matches.map((m) => (
          <article
            key={m.provider.id}
            className={`result-card ${m.score > 0 ? "featured" : ""}`}
          >
            <div className="result-top">
              <ProviderName id={m.provider.id} name={m.provider.name} />
              <span className="badge">
                {m.compatible === false
                  ? "Ingen eksakt størrelsesmatch"
                  : m.compatible === null
                    ? "Må avklares"
                    : m.score > 0
                      ? "Matcher prioriteringen"
                      : "Størrelsen passer"}
              </span>
            </div>
            <ul>
              {m.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            {m.priceQuote && (
              <div className="result-price-context">
                <p>
                  Ordinær kasse uten introtilbud eller retter og varer med
                  pristillegg.
                </p>
                <a
                  className="source-date"
                  href={m.priceQuote.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Priskilde · kontrollert{" "}
                  {formatDate(m.priceQuote.source.checkedAt)} ↗
                </a>
                <a
                  className="source-date"
                  href={m.priceQuote.deliverySource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Fraktkilde · {m.priceQuote.deliveryFee} kr · kontrollert{" "}
                  {formatDate(m.priceQuote.deliverySource.checkedAt)} ↗
                </a>
              </div>
            )}
            {m.unknown.map((r) => (
              <p className="result-warning" key={r}>
                {r}
              </p>
            ))}
            {m.compatible !== false && (
              <>
                <Link href={`/${m.provider.id}`} className="text-link">
                  Vurder begrensningene hos {m.provider.name}{" "}
                  <ArrowRight size={15} />
                </Link>
                <Outbound
                  id={m.provider.id}
                  name={m.provider.name}
                  placement="selector_result"
                  affiliate={flags[m.provider.id]}
                />
              </>
            )}
            {m.compatible === false &&
              answers.people === 3 &&
              m.provider.id === "hellofresh" && (
                <p className="result-warning">
                  Fire porsjoner kan være et alternativ om dere ønsker rester.
                  Det er en annen størrelse og pris.
                </p>
              )}
          </article>
        ))}
        <div className="result-links">
          <button
            className="button button-outline"
            onClick={() => {
              setStep(0);
            }}
          >
            <RotateCcw size={16} /> Endre svarene
          </button>
          <Link className="text-link" href="/hellofresh-vs-godtlevert">
            Se hele sammenligningen <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="wizard-progress" aria-hidden="true">
        {[0, 1, 2].map((n) => (
          <span key={n} className={n <= step ? "done" : ""} />
        ))}
      </div>
      <div className="step-meta">
        <span>Steg {step + 1} av 3</span>
        <Link href="/hellofresh-vs-godtlevert">
          Hopp rett til sammenligningen
        </Link>
      </div>
      <div className="wizard-panel">
        <h2 ref={heading} tabIndex={-1} id="step-title">
          {titles[step]}
        </h2>
        <p>{descriptions[step]}</p>
        <div
          role="radiogroup"
          aria-labelledby="step-title"
          className={`option-grid ${step === 2 ? "wide" : ""}`}
        >
          {(step === 0
            ? [2, 3, 4, 5, 6, 7]
            : step === 1
              ? [2, 3, 4, 5]
              : ["price", "selection", "none"]
          ).map((value) => (
            <label className="option" key={value}>
              <input
                type="radio"
                name={key}
                value={value}
                checked={answers[key] === value}
                onChange={() => choose(key, value)}
              />
              <span>
                {step === 0
                  ? `${value === 7 ? "7+" : value} porsjoner`
                  : step === 1
                    ? `${value} middager`
                    : priorities[value as keyof typeof priorities]}
              </span>
            </label>
          ))}
        </div>
        <div className="wizard-actions">
          <button
            className="wizard-back"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
          >
            <ArrowLeft
              size={15}
              style={{ display: "inline", marginRight: 7 }}
            />
            Tilbake
          </button>
          <button
            className="button button-primary"
            disabled={answers[key] === undefined}
            onClick={next}
          >
            {step === 2 ? "Se hva som passer" : "Neste"}
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
      <p className="price-note">
        Svarene brukes bare til denne sammenligningen og lagres ikke som en
        profil.{" "}
        <Link href="/slik-sammenligner-vi">Slik fungerer vurderingen.</Link>
      </p>
    </>
  );
}
