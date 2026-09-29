# Produksjonsoppsett og senere aktivering

Arbeidsmappe: repo-roten. Dette er et Next.js-prosjekt som trenger en Node-kompatibel Next.js-vert. Det er ikke en statisk eksport. Ingen hosting, DNS eller konto er opprettet/endret i sprinten.

## Konfigurasjon

Bruk `.env.example` som mal i valgt verts miljøvariabler. Faktiske sporingslenker skal ikke lagres i Git. `NEXT_PUBLIC_*` bygges inn i klienten; endringer krever nytt bygg.

- `NEXT_PUBLIC_SITE_URL=https://middagskasser.no`
- `NEXT_PUBLIC_GA_ID`: reell G-ID fra riktig GA4-datastrøm.
- `HELLOFRESH_AFFILIATE_URL` og `GODTLEVERT_AFFILIATE_URL`: valgfrie. Tomme verdier gir den godkjente eButikker.no-fallbacken. En satt verdi må være en godkjent HTTPS-lenke fra eget Adtraction-program, på `track.adtraction.com` eller `adtr.co`, ellers gir lanseringskontrollen NO-GO.
- `PRIVACY_OPERATIONS`: ferdig godkjent tekst om drifts- og e-postleverandør, databehandlere, behandlingssted, tekniske logger, formål, grunnlag, lagring og overføringsgrunnlag utenfor EØS, også for Google der aktuelt.
- `PRIVACY_CONTACT_RETENTION`: faktisk lagringstid og behandlingsgrunnlag for kontaktmeldinger.
- `GA_RETENTION_MONTHS`: 2 eller 14, identisk med innstillingen i GA4. Slå av forlengelse ved ny aktivitet hvis den beskrevne fristen skal gjelde.
- `LAUNCH_VERIFIED=true`: først etter bekreftet kildeferskhet, personverntekst/databehandleravtaler, partnerrettigheter, faktiske destinasjoner og QA i valgt drift.
- `NEXT_PUBLIC_INDEXABLE=true`: bare i det endelige produksjonsbygget etter kontrollen over. Forhåndsvisninger skal ha false.

Et indeksbart bygg stopper hvis påkrevde verdier mangler. Denne sperren validerer format og eksplisitt bekreftelse, ikke innholdet i avtaler eller om en ID faktisk tilhører riktig konto. `npm run check:launch` gir i tillegg NO-GO ved utdaterte faktakilder eller priser.

## Affiliate

Sentral konfigurasjon i `lib/commercial.ts`. Eksisterende `/go/hellofresh` og `/go/godtlevert` sender 302 med `X-Robots-Tag: noindex, nofollow` og `Cache-Control: no-store`.

EPI er `<provider>_<placement>`; tillatte plasseringer er `comparison`, `selector_result` og `provider_bottom`. Ukjent/manglende plassering blir `direct`. Ingen brukerdata legges til. Eventuell Adtraction-deeplinkparameter `url` beholdes sist, som dokumentert av [Adtraction](https://help.adtraction.com/en/articles/1563109-get-started-with-epi).

Tom eller ugyldig konfigurasjon gir en vanlig lenke til leverandørsiden på eButikker.no (`lib/commercial.ts`), knappeteksten «Til <leverandør> via eButikker.no» og ingen annonsemerking. Aktive annonselenker får `rel="sponsored nofollow"`, synlig tekst ved knappen og forklaring med navngitte partnere før første kommersielle lenke. Alle landingssider henter flaggene dynamisk. Kommersiell konfigurasjon brukes ikke av vurderingsfunksjonen.

## GA4 og samtykke

Basic consent-oppsett: ingen Google-kode eller forespørsel før samtykke. Avvisning og aksept er likeverdige knapper. Versjonert samtykke/avvisning varer maksimalt 180 dager. Tilbaketrekking fjerner våre GA-cookies og stopper koden ved omlasting, også i andre åpne faner. Gamle uversjonerte valg godtas ikke som nytt samtykke.

`analytics_storage` gis bare etter aksept. `ad_storage`, `ad_user_data` og `ad_personalization` forblir denied. Ingen Google Signals, bruker-ID eller annonsepiksel er lagt inn. Dette følger [Googles beskrivelse av basic consent](https://developers.google.com/tag-platform/security/concepts/consent-mode).

**I GA4-admin før aktivering:** slå av Enhanced Measurement/automatisk historie- og utgående lenkemåling for denne datastrømmen, Google Signals, brukerdata og annonsepersonalisering. Applikasjonen sender eksplisitte sidevisninger og hendelser; automatikk kan ellers gi duplikater eller flere opplysninger enn beskrevet. Bekreft dataretensjon, databehandlervilkår og eventuelle overføringer. Kontroller deretter i DebugView at hvert klikk gir én hendelse.

| Event | Parametre og tidspunkt |
|---|---|
| selector_start | `page`, `placement`; første besvarte spørsmål i en velgerøkt |
| selector_answer | `step`, `answer_id`; bare forhåndsdefinerte alternativer |
| selector_complete | `result_type`, `method_version`; når resultatet åpnes |
| comparison_view | `page`, `placement`; første synlige visning med samtykke |
| comparison_expand | `page`, `section`; ekstra detaljfelt åpnes/lukkes |
| provider_view | `provider`, `page`; leverandørside vises |
| affiliate_click | `provider`, `placement`, `page`, `offer_type`; bare aktiv annonselenke |
| sibling_site_click | `placement`, `page`, `direction` |
| page_view | `page_path`; manuell visning etter samtykke og ved ruteskift |
| provider_outbound | Som affiliate_click, men for vanlig leverandørlenke |

Alle hendelser får sanitert `page_location` uten søkeparametre/hash og tom `page_referrer`. Parametre har tillatte verdilister; vilkårlig tekst sendes ikke. Hendelser før samtykke spilles ikke av i etterkant. En aktuell sidevisning kan registreres når samtykke gis.

## Senere produksjonskontroll

1. Avklar restpunktene i rapporten og fyll ekte konfigurasjon.
2. Test på valgt verts forhåndsvisning, fortsatt noindex. Test begge ekte affiliate-lenker uten å bestille; bekreft partner og EPI hos Adtraction.
3. Bekreft ingen Google-forespørsler ved nytt besøk eller avvisning, og korrekt enkel levering til GA4 etter aksept. Test tilbaketrekking, cookie-sletting og mobil Safari/Chrome på fysiske enheter.
4. Avklar domenealias og permanent videresending fra HTTP/www til `https://middagskasser.no`. Bekreft TLS, loggpolicy og riktig cacheoppførsel.
5. Kjør `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` og `npm run check:launch` i riktig miljø. Kjør HTTP-kontrollene med forventet indeksmodus tilpasset produksjon.
6. Verifiser ni offentlige URL-er i sitemap, selector/design/go/404 uten indeksering, selvrefererende canonical og fungerende logoer/OG på det faktiske domenet.

Disse punktene er dokumenterte restoppgaver, ikke utførte kontohandlinger. GA4-ID, affiliate-lenker og logorettigheter er uttrykkelig utsatt av eier.
