# Drift, tilganger og gjenoppretting

Kort driftsark for Middagskasser.no. Sist oppdatert 21.10.2026. Kontoinnstillingene nedenfor er eiers ansvar og er ikke lest av verktøy.

## 1. Tilganger og tofaktor (manuell kontroll for eier)

Kryss av, og noter dato, når hver konto er kontrollert. Kontroller også hvem andre som har tilgang, og fjern tilganger som ikke trengs.

| Konto | Hva den styrer | Kontroller |
| --- | --- | --- |
| GitHub (`jaswane`) | Koden og automatisk deploy via `main` | Tofaktor på, gjenopprettingskoder lagret utenfor GitHub, ingen ukjente samarbeidspartnere på `jaswane/middagskasser` |
| Vercel (Pro, prosjekt `middagskasser`) | Drift, miljøvariabler og rollback | Tofaktor på, bare nødvendige teammedlemmer, miljøvariabler (GA-ID, `PRIVACY_OPERATIONS`, `LAUNCH_VERIFIED`, `NEXT_PUBLIC_INDEXABLE`) kjente og dokumenterte |
| Domeneshop | Domenet middagskasser.no og e-post | Tofaktor på, domenet låst mot overføring, fornyelsesdato og betalingsmåte i orden |
| Google-konto | GA4-egenskapen og Search Console | Tofaktor på, gjenopprettingsmetoder oppdatert, ingen ukjente brukere i GA4 og Search Console |
| Adtraction | Affiliateprogrammer (ikke i bruk ennå) | Tofaktor der det tilbys. Hvis ikke: sterkt unikt passord og notert risikovurdering |

## 2. Gjenopprettingsprøve

Minste prøve, kjørt 21.10.2026:

1. Fersk klone fra GitHub av produksjonscommit `d7d4671`.
2. `npm ci` (377 pakker, 48 sekunder).
3. `npm run build`: grønt bygg. Hele prøven tok 67 sekunder.
4. Tidligere produksjonsdeploys finnes og kan brukes til rollback: Vercel har registrert deploys av `d7d4671`, `b4589a1`, `6fd8d6a`, `7e76306`, `833348f`, `961fa28`, `eaf06cb` og `296598c` (GitHub deployments, miljø «Production»).

**Ved feil i produksjon:** Vercel → Deployments → velg forrige fungerende produksjonsdeploy → «Instant Rollback» eller «Promote to Production». Sjekk forsiden, `/levering` og `/billigste-matkasse` etterpå. Rett feilen i koden og deploy på nytt. Rollback ble ikke prøvd i produksjon.

**Ved tap av GitHub-repoet:** Vercel-deployene inneholder bare bygget kode, ikke kildekoden. Ha alltid en lokal klone, eller en klone til, oppdatert.

Gjenta prøven hvert halvår, og etter større oppgraderinger av Next.js eller Node.

## 3. GA4: Enhanced Measurement må være av

Kontrollert 21.10.2026 i den offentlige gtag-konfigurasjonen for G-2QE2FCW5YH: **fortsatt på.** Utgående klikk, sidevisninger ved historikkendringer, rulling, skjema, video og nedlastinger er aktive.

Slik slår eier det av: GA4 → Admin → Datastrømmer → velg strømmen for middagskasser.no → **Enhanced measurement** → slå av hele bryteren. Det holder ikke å slå av bare «Outbound clicks»; sidevisninger ved historikkendringer kan også gi doble sidevisninger. Lagre.

Verifisering etterpå, med samtykke gitt i en testøkt:
- én `page_view` per navigasjon
- ingen automatiske `click`-, `scroll`-, `form_*`- eller `file_download`-hendelser
- `provider_outbound` fyrer fortsatt ved klikk på en leverandørknapp
- trekk samtykket tilbake etter testen

Til dette er gjort, bør GA-data ikke brukes til å vurdere effekt.

## 4. Tilgang for søkemotorer og AI-tjenester

`robots.txt` tillater i dag alle crawlere (`User-Agent: *`, `Allow: /`). Endringer i treningstilgang krever eiers beslutning. robots.txt er ingen sikkerhetsmekanisme; nettstedet har ikke noe privat innhold.

| Crawler | Formål | I dag | Anbefaling |
| --- | --- | --- | --- |
| Googlebot | Google-søk, også kvalifisering for AI Overviews og AI Mode | Tillatt | Behold |
| Google: «Search generative AI control» i Search Console | Om nettstedet tas med i Googles generative søkefunksjoner | Ikke kontrollert (standard er inkludert) | Behold inkludert, men bekreft i Search Console |
| Google-Extended | Bruk i Googles AI-modeller utenfor Search. Påvirker ikke Search. | Tillatt | Eiers valg |
| Bingbot | Bing-søk og Microsofts AI-svar | Tillatt | Behold |
| OAI-SearchBot | Visning og sitering i ChatGPT-søk | Tillatt | Behold |
| ChatGPT-User | Besøk som en bruker ber ChatGPT om | Tillatt | Behold |
| GPTBot | Mulig trening av OpenAIs modeller | Tillatt | Eiers valg |
| PerplexityBot | Perplexitys søkeindeks | Tillatt | Behold |
| Perplexity-User | Besøk som en bruker ber Perplexity om | Tillatt | Behold |
| ClaudeBot / CCBot | Trening (Anthropic) / åpent datasett som ofte brukes til trening (Common Crawl) | Tillatt | Eiers valg |

Søke- og brukerbesøk bør være tillatt, fordi nettstedets verdi er offentlig beslutningshjelp. Om innholdet skal brukes til modelltrening, er en egen beslutning som ikke påvirker vanlig søk. Faktiske besøk fra robotene er ikke kontrollert mot serverlogger.

## 5. Baseline 21.10.2026

**Ytelse:**
- **Labdata:** Lighthouse 12.8.2 mot produksjon, med standard mobilstruping og desktop-forhåndsinnstilling.
  - LCP: mobil 1,5–1,9 s, desktop 0,4–0,6 s
  - CLS: høyst 0,004
  - TBT: høyst 76 ms
  - Overført: 177–231 kB, hvorav JS 155–159 kB
  - Ingen tredjepartsskript før samtykke
  - LCP-element: forsidebildet på forsiden, ellers H1 eller tekst
- **Feltdata:** ingen ennå. PageSpeed Insights var over dagskvoten, og nettstedet er for nytt til å forvente data i CrUX.

**Tilgjengelighet:** Kontrollert på `/`, `/finn-matkasse`, `/matkasser`, `/beste-matkasse`, `/billigste-matkasse`, `/levering` og `/hellofresh`.
- **Reflow og zoom:** Ingen tap av innhold eller funksjon ved 320 CSS px og ved 200 % zoom (640 px).
- **Struktur:** Én H1 per side, ingen hoppede overskriftsnivåer, landemerker og hopplenke på plass.
- **Skjema og tabeller:** Alle tabelloverskrifter har `scope`, og alle felt har etikett.
- **Trykkflater:** Ingen flater bryter avstandsregelen i WCAG 2.5.8.
- **Redusert bevegelse:** Respektert.
- **Rettet 21.10.2026:** Samtykkebanneret kunne skjule tastaturfokus nederst i vinduet. Det har nå `scroll-padding-bottom` mens det er åpent.
- **Ikke gjort:** test med ekte skjermleser og brukertest med personer.

## 6. Avhengigheter

- 21.10.2026: Next.js ble oppdatert fra 16.3.6 til 16.3.8 for å lukke advarsler med høy alvorlighetsgrad, blant annet SSRF i bildeoptimaliseringen og cache-forgiftning. Produksjonsavhengighetene har 0 kjente sårbarheter (`npm audit --omit=dev`).
- **Åpent:** ESLint 9.39.5 er utløpt for støtte, og `eslint-config-next` drar inn `braces`/`micromatch` med kjente svakheter. Det gjelder bare utviklingsverktøy. Ta det i en egen oppgradering av lint-oppsettet.
