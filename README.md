# Middagskasser.no

Norsk beslutningshjelp for å velge matkasse. Live og indeksert på https://middagskasser.no. Drives av Swane Creative ENK.

## Status 21.10.2026

- **Drift:** Vercel (Pro), region iad1, med automatisk deploy fra `main` på GitHub. Domenet ligger hos Domeneshop.
- **Analyse:** GA4 lastes bare etter samtykke (`components/analytics.tsx`). ID og lagringstid står i Vercel-miljøet (`NEXT_PUBLIC_GA_ID`, `GA_RETENTION_MONTHS`) og aldri i koden. Enhanced Measurement må være slått av i GA4-admin; per 21.10.2026 er det fortsatt på, se [drift](docs/drift.md).
- **Leverandørlenker:** `/go/<leverandør>` sender til leverandørsidene på eButikker.no så lenge ingen direkte Adtraction-lenker er satt (`lib/commercial.ts`). Kokkeløren får en vanlig lenke uten provisjon.
- **Logoer:** Ingen leverandørlogoer brukes før rettighetsgrunnlaget er dokumentert ([provider-assets](docs/rights/provider-assets.md)).

## Hva nettstedet dekker

| Rute | Oppgave |
| --- | --- |
| `/` | Sammenligning av HelloFresh og Godtlevert for valgt kassestørrelse |
| `/finn-matkasse` | Velger med tre spørsmål (noindex) |
| `/matkasser` | Markedsoversikt: seks kontrollerte tjenester og nedlagte aktører |
| `/beste-matkasse` | Hvem som peker seg ut for ulike behov |
| `/billigste-matkasse` | Laveste ukepris og porsjonspris, ordinær pris |
| `/levering` | Svar fra leveringssjekkene for 23 postnumre |
| `/hellofresh`, `/godtlevert` | Leverandørsider i hovedsammenligningen (`tier: "core"`) |
| `/kokkeloren` | Redaksjonell leverandørside (`tier: "editorial"`) |
| `/hellofresh-vs-godtlevert`, `/slik-sammenligner-vi`, `/om`, `/kontakt`, `/personvern`, `/annonselenker` | Sammenligning, metode og tillit |

## Data og ferskhet

Utdaterte opplysninger skjules automatisk. Endre aldri en dato uten å ha kontrollert opplysningen på nytt.

| Data | Fil | Vises i |
| --- | --- | --- |
| Priser og frakt | `lib/data.ts` | 30 dager |
| Produktfakta | `lib/data.ts` | 90 dager (oppgitt utvalg 30) |
| Levering per postnummer | `lib/delivery.ts` | 120 dager (frakt 30) |
| Markedsoversikt | `lib/market.ts` | Dato vises per tjeneste |

Beregninger ligger i `lib/cheapest.ts`, `lib/best.ts` og `lib/coverage.ts` og er dekket av tester.

## Vedlikehold

- **Hver måned:** priser, frakt og oppgitt utvalg. Neste frist er 07.11.2026.
- **Hvert kvartal:** leveringsprøven (69 oppslag, anslagsvis 75–90 minutter) og produktfakta. Leveringssvarene utløper 05.02.2027.
- **Ved kjent endring:** ekstra kontroll av det som er berørt.

Metode, kilder og rutiner står i [research-leverandorer](docs/research-leverandorer.md).

## Kjør lokalt

```powershell
npm.cmd ci
npm.cmd run dev
npm.cmd run test
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
# Med produksjonsserver i gang, for eksempel npx next start -p 3100:
$env:TEST_BASE_URL="http://127.0.0.1:3100"; node tests/http-smoke.mjs
# Krever produksjonsmiljøet (Vercel); lokalt gir den NO-GO for manglende variabler:
npm.cmd run check:launch
```

## Dokumentasjon

- [Produktstrategi](docs/produktstrategi.md): målgruppe, informasjonsarkitektur og hva som ikke skal bygges
- [Leverandørresearch](docs/research-leverandorer.md): kilder, priskontroller, leveringsprøve og rutiner
- [Logoer og rettigheter](docs/rights/provider-assets.md)
- [Drift, tilganger og gjenoppretting](docs/drift.md)
- Historikk: [produksjonssprint](docs/production-sprint/rapport.md) og [leveranse og QA](docs/leveranse-og-qa.md) fra lanseringen
