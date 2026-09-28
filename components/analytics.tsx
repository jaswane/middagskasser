"use client";
import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CONSENT_KEY,
  consentValue,
  newConsent,
  validGaId,
  measuredPath,
  eventParams,
  consentCommands,
  type MeasurementEvent,
} from "@/lib/measurement";
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
const gaId = process.env.NEXT_PUBLIC_GA_ID;
let enabled = false;
let volatileConsent: string | null = null;
let storageUnavailable = false;
function readConsent() {
  if (storageUnavailable) return consentValue(volatileConsent);
  try {
    return consentValue(localStorage.getItem(CONSENT_KEY));
  } catch {
    return consentValue(volatileConsent);
  }
}
function snapshot() {
  return readConsent()?.choice || null;
}
function subscribe(listener: () => void) {
  const onStorage = () => {
    volatileConsent = null;
    storageUnavailable = false;
    if (enabled && readConsent()?.choice !== "yes") {
      disable();
      location.reload();
      return;
    }
    listener();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("consent-change", listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("consent-change", listener);
  };
}
function saveConsent(value: "yes" | "no") {
  volatileConsent = JSON.stringify(newConsent(value));
  try {
    localStorage.setItem(CONSENT_KEY, volatileConsent);
    storageUnavailable = false;
  } catch {
    storageUnavailable = true;
  }
  window.dispatchEvent(new Event("consent-change"));
}
function disable() {
  enabled = false;
  if (validGaId(gaId))
    (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] = true;
  document.querySelector("script[data-middagskasser-analytics]")?.remove();
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.trim().split("=")[0];
    if (name === "_ga" || name.startsWith("_ga_")) {
      document.cookie = `${name}=; Max-Age=0; path=/`;
      const parts = location.hostname.split(".");
      for (let i = 0; i < parts.length - 1; i++)
        document.cookie = `${name}=; Max-Age=0; path=/; domain=.${parts.slice(i).join(".")}`;
    }
  });
}
export function track(
  event: MeasurementEvent,
  params: Record<string, string | number> = {},
) {
  const clean = eventParams(event, params);
  if (!enabled || readConsent()?.choice !== "yes" || !window.gtag || !clean)
    return false;
  window.gtag("event", event, {
    ...clean,
    page_location: location.origin + measuredPath(location.pathname),
    page_referrer: "",
  });
  return true;
}
export function Analytics() {
  const choice = useSyncExternalStore(subscribe, snapshot, () => "loading");
  const pathname = usePathname();
  useEffect(() => {
    if (!validGaId(gaId) || choice !== "yes") return;
    (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] =
      false;
    window.dataLayer = window.dataLayer || [];
    // Google's gtag queue consumes IArguments entries, not event arrays.
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    for (const args of consentCommands(
      gaId,
      location.origin + measuredPath(location.pathname),
    ))
      window.gtag(...args);
    enabled = true;
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.async = true;
    script.dataset.middagskasserAnalytics = "true";
    document.head.appendChild(script);
    document.dispatchEvent(new Event("analytics-ready"));
    // Split long waits to respect the browser's 32-bit timeout limit.
    let timer: number;
    const checkExpiry = () => {
      const consent = readConsent();
      if (consent?.choice !== "yes") {
        disable();
        location.reload();
      } else
        timer = window.setTimeout(
          checkExpiry,
          Math.min(consent.expires - Date.now(), 2147483647),
        );
    };
    checkExpiry();
    return () => {
      enabled = false;
      script.remove();
      clearTimeout(timer);
    };
  }, [choice]);
  useEffect(() => {
    if (choice !== "yes") return;
    track("page_view", { page_path: measuredPath(pathname) });
    const provider = pathname.slice(1);
    if (["hellofresh", "godtlevert"].includes(provider))
      track("provider_view", { provider, page: pathname });
  }, [pathname, choice]);
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest('a[data-event="sibling_site_click"]'))
        track("sibling_site_click", {
          page: measuredPath(location.pathname),
          placement: "sibling_section",
          direction: "middagskasser_to_middagen",
        });
    };
    document.addEventListener("click", listener);
    return () => document.removeEventListener("click", listener);
  }, []);
  if (!validGaId(gaId) || choice !== null) return null;
  return (
    <section className="consent" aria-label="Valg for statistikk">
      <div>
        <strong>Kan vi måle hvordan siden brukes?</strong>
        <p>
          Med ditt samtykke bruker vi Google Analytics til besøksstatistikk og
          måling av valg og lenker. Valget lagres i 180 dager og kan trekkes
          tilbake. <Link href="/personvern">Les om personvern</Link>.
        </p>
      </div>
      <button
        className="button button-outline"
        onClick={() => saveConsent("no")}
      >
        Avvis statistikk
      </button>
      <button
        className="button button-outline"
        onClick={() => saveConsent("yes")}
      >
        Tillat statistikk
      </button>
    </section>
  );
}
export function ConsentSettings() {
  return (
    <div>
      <button
        className="button button-outline"
        onClick={() => {
          disable();
          saveConsent("no");
          location.reload();
        }}
      >
        Trekk tilbake statistikkvalg
      </button>
      {validGaId(gaId) && (
        <button
          className="button button-text"
          onClick={() => {
            disable();
            volatileConsent = null;
            try {
              localStorage.removeItem(CONSENT_KEY);
            } catch {}
            location.reload();
          }}
        >
          Velg på nytt
        </button>
      )}
      <p>
        {!validGaId(gaId)
          ? "Statistikk er ikke aktivert på denne siden."
          : "Du kan endre valget når som helst. Tilbaketrekking laster siden på nytt, fjerner våre GA-informasjonskapsler og slår av statistikken."}
      </p>
    </div>
  );
}
