# Middagskasser.no

En norsk beslutningshjelper for å sammenligne Godtlevert og HelloFresh. Produksjonssprint gjennomført 28.09.2026 med Next.js, React, TypeScript og Tailwind/CSS. Lokal forhåndsvisning, ikke offentlig lansert. Lanseringsstatus: **NO-GO** inntil bekreftet kommersiell konfigurasjon, personvern og driftskontroll foreligger.

## Leveransen

- [Produksjonssprint og GO/NO-GO](docs/production-sprint/rapport.md): siste funn, gjennomført QA og konkrete restpunkter.
- [Verifiserte fakta](docs/production-sprint/kildekontroll.md) og [produksjonsoppsett](docs/production-sprint/produksjonsoppsett.md).
- [Produktstrategi A–R](docs/produktstrategi.md): målgruppe, MVP, IA, datamodell, velger, designfamilie, affiliate, SEO, analyse, vedlikehold, risiko og v1.
- [Primærkilder og prisresearch](docs/research-leverandorer.md): 16 prisobservasjoner fordelt på åtte felles pakker, produktfakta, kontrolltidspunkt og kildekonflikter.
- [Leveranse og faktisk QA](docs/leveranse-og-qa.md): implementasjon, skjermdekning, testresultater og gjenstående lanseringsarbeid.
- [Desktoputkast](docs/screenshots/forside-desktop.png), [mobilforside](docs/screenshots/forside-mobil.png), [mobil sammenligning](docs/screenshots/sammenligning-mobil.png), [velgerresultat](docs/screenshots/selector-resultat-mobil.png).

## Kjør lokalt

Fra repo-roten:

```powershell
npm.cmd ci
npm.cmd run dev
```

Åpne adressen som serveren skriver ut, normalt http://127.0.0.1:3000.

```powershell
npm.cmd run test
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
# Med lokal server i gang:
node tests/http-smoke.mjs
# Krever ferdig produksjonskonfigurasjon; gir forventet NO-GO nå:
npm.cmd run check:launch
```

Produksjonsserver: `npm.cmd run start` etter et vellykket bygg. Domenet krever en Next.js-kompatibel driftstjeneste; denne versjonen er ikke en ren statisk eksport fordi den har sentrale `/go/`-ruter og serverrendering med datoferskhet.

## Hvor endrer man hva?

| Fil | Ansvar |
| --- | --- |
| `lib/data.ts` | Leverandørfakta, kilde per felt, priser, frakt, kontrollfrist og tilbud |
| `lib/selector.ts` | Ren og testbar matchlogikk; ingen tilgang til kommersielle data |
| `lib/commercial.ts` | Godkjente sentrale destinasjoner og affiliatekonfigurasjon |
| `components/comparison.tsx` | Sammenligning og pakkevalg, mobil og desktop |
| `components/selector.tsx` | Tre steg og forklarte resultater |
| `components/provider-page.tsx` | Felles struktur for leverandørsider |
| `app/[slug]/page.tsx` | Versus-, metode-, tillits- og designoversiktsider |
| `components/analytics.tsx` | Samtykkestyrt, valgfri analyse; avslått i leveransen |
| `app/globals.css` | Felles designverdier og responsive komponenter |
| `.env.example` | Konfigurasjonsnavn, uten hemmeligheter eller sporingslenker |

## Før offentlig lansering

Behold `NEXT_PUBLIC_INDEXABLE=false` til lanseringslisten er gjennomført. Sett ikke inn en GA4-ID før samtykke og faktisk nettverkstrafikk er testet og personvernteksten er ferdigstilt. Affiliate-URL-er er tomme: knapper går til leverandørenes vanlige sider. Bekreft reelle Adtraction-lenker, EPI-felt og gjeldende vilkår før aktivering. Ingen provisjonssatser ligger i prototypens data eller matcher.

Middagen.no sitt eksisterende design kunne ikke hentes. Familieutkastet på `/designoversikt` er et forslag, som må avstemmes mot den faktiske søstersiden.

Prisdata blir skjult som gjeldende etter 30 dager uten kontroll; andre produktfakta etter 90 dager. Endre aldri dato bare for å gjøre dataene «ferske». Gjenta kildekontrollen og oppdater det konkrete feltet.
