# Leveranse og faktisk QA

Kontroll 28.09.2026. Dette dokumentet skiller gjennomført arbeid fra krav før offentlig drift.

## Hva som er bygget

En lokal high-fidelity prototype med selvstendig ordmerke, papirhvit bakgrunn, blå aksent, Georgia/Arial, matfoto og åpne sammenligningsrader. Ingen rabatt dominerer første skjerm. Samme datakilde brukes i sammenligning, leverandørsider og velger. Begge leverandører vises alfabetisk, ikke etter provisjon.

Tretrinns velger bruker porsjoner, middager og prioritet. Den har ingen forhåndsvalg og kan vise likt resultat, prisfordel i et konkret standardeksempel, større leverandøroppgitt utvalg, bare én støttet kassestørrelse, ingen støttet størrelse eller uavklart datagrunnlag. Resultatene viser begrunnelse og relevante forbehold før utgående knapp.

Prisfilteret har 2–6 porsjoner og 2–5 middager. Bare de åtte verifiserte pakkekombinasjonene per leverandør viser priser. Ingen interpolasjon for 3, 5 og 6 porsjoner. Prisene inkluderer oppgitt frakt når denne er kjent; HelloFreshs postnummereksempel og Godtleverts beregnede standardtotal er tydelig skilt.

Pris/utvalg har 30 dagers kontrollfrist, øvrige strukturerte produktfakta 90. Datadrevne sider serverrenderes per forespørsel, slik at et tidligere produksjonsbygg ikke låser ferskhetsdatoen. Klientverktøyene kontrollerer også ferskhet ved beregning. Manglende frakt gir ingen total på leverandørsiden og ingen prispoeng. Tilbud har separat gyldighetslogikk.

## Skjermdekning

| Krav | Faktisk plassering |
| --- | --- |
| Forside desktop/mobil | `/`, med lagrede skjermbilder |
| Direkte sammenligning/mobil | `/#sammenligning` og `/hellofresh-vs-godtlevert` |
| Velgersteg | `/finn-matkasse`, 3 native radiogrupper |
| Resultat | Samme route, inkludert delt og tomt resultat |
| HelloFresh/Godtlevert | `/hellofresh` og `/godtlevert` |
| Versus | `/hellofresh-vs-godtlevert`, tabell og konkrete avveininger |
| Aktivt/utløpt/intet tilbud | `/designoversikt`, aktivt/utløpt er eksplisitte, ikke-bestillbare designeksempler |
| Metode | `/slik-sammenligner-vi` |
| Affiliateinformasjon | `/annonselenker` og merking ved aktive kommersielle knapper |
| Middagen.no-krysslenke | Forsiden og `/om` |
| Header/footer | Felles for alle sidene |
| 404 | Ukjent URL gir faktisk HTTP 404 |

Øvrige sider: `/om`, `/kontakt`, `/personvern`. Designoversikt og velger skal ikke indekseres. Hele prototypen er foreløpig noindex, med tomt sitemap og disallow i robots for utkastet. Ved lansering blir noindex-rutene crawlbare; `/go/` har egen `X-Robots-Tag` og er aldri i sitemap.

Schema i leveransen: `Organization`, `WebSite` og `BreadcrumbList` på relevante innholdssider. Ingen karakterer, Review, AggregateRating eller Product. Kanoniske URL-er og norske titler/beskrivelser er satt per side. E-post står bare på kontaktsiden i offentlig HTML.

## Automatisert verifikasjon

Gjennomført og bestått:

- `npm run build`: vellykket produksjonsbygg og TypeScript-kontroll.
- `npm run typecheck`: ingen typefeil.
- 10 domenetester: prisfordel som skifter med pakke, prislikhet, inkompatible størrelser, ukjente felt, utløpte pris- og fraktkilder, utvalgsferskhet, uavhengighet fra provisjonsdata, tilbudsdatoer og tillatte redirect-verter.
- HTTP-test av 11 sider: 200, H1, canonical, noindex, kontaktregel og ingen aktiv GA-scriptkonfigurasjon.
- Ukjent side og ukjent `/go/`-leverandør gir 404.
- Begge kjente `/go/`-ruter gir 302 til riktig vanlig leverandørside. En innsendt fremmed `url`-parameter påvirker ikke destinasjonen. Noindex-header er kontrollert.
- Sitemap uten velger, designoversikt eller `/go/`; robots sperrer foreløpig utkastet.

Testfilene ligger i `tests/`. Domenetestene bruker en fast dato slik at prøvene fortsatt gir meningsfulle svar når kalenderen går videre.

## Nettleserkontroll

Gjennomført med faktisk nettleser, uten bestillinger eller innlogging:

- Forside og sammenligning visuelt kontrollert på desktop og 390 px mobil.
- Ingen horisontal dokumentoverflow observert ved 320, 390, 768 og 1440 px i de kontrollerte visningene.
- Bildet er lastet og har meningsfull alternativtekst; ingen eksterne skrifter.
- Pakkevalg 4 × 4 viser 1 349 kr for begge. Valg 3 × 4 viser manglende Godtlevert-pris og at HelloFresh-størrelsen ikke er oppgitt.
- Tre steg gjennomført på mobil med 4 × 4 og prisprioritet: resultatet sier at begge kan være aktuelle, og begrunner prislikheten.
- Tastatur: Space og pil høyre endrer native radio fra 2 til 3 porsjoner. Frem/tilbake beholder svaret. Fokus flyttes til ny stegtittel.
- Godtlevert-siden åpnet og kontrollert for kilde, prisgrunnlag, fraktforbehold og innhold.
- Ingen Google Tag Manager-script i DOM med levert, tom analysekonfigurasjon.

Lagrede skjermbilder: `screenshots/forside-desktop.png`, `forside-desktop-hel.png`, `forside-mobil.png`, `sammenligning-mobil.png`, `selector-resultat-mobil.png`.

Ikke gjennomført: formell WCAG-revisjon, skjermlesertest, eksplisitt 200 % nettleserzoom, Lighthouse/CWV-måling, reelle brukerintervjuer, mat-/leveringstest, aktiv GA4-nettverksmåling eller faktisk affiliatekonvertering. Disse er ikke presentert som bestått.

## Kommersiell og teknisk status

Ingen reelle affiliate-URL-er ble levert. Sentral konfigurasjon er klar; nå brukes vanlige leverandørlenker, uten å late som provisjon spores. Når godkjente kommersielle lenker legges inn, vises forklaringen før knappen, `rel="sponsored nofollow"` brukes, og partner/plassering settes som kontrollert EPI-verdi. Verifiser dette mot den faktiske Adtraction-kontoen før aktivering.

GA4 er avslått. Koden har samtykkeporter, likeverdige aksept-/avvisknapper, rutebaserte side-/leverandørhendelser, samtykkebevisst sammenligningsvisning, velgerhendelser og klikkhendelser. Tilbaketrekking deaktiverer GA, sletter kjente GA-cookies, lagrer avvisning og laster siden på nytt. Et virkelig måleoppsett, eventkontrakten og nettverksoppførsel skal prøves før produksjonsaktivering. `offer_view` og komplett KPI-kontrakt er fortsatt planlagt; ingen ekte kampanje er aktiv.

Personvernsiden er et tydelig merket utkast. Faktisk behandlingsansvarlig virksomhet, driftsleverandør, databehandlere, lagringstider, rettighetsinformasjon og eventuelle overføringer må fylles ut før offentlig lansering.

Sites-ferdigheten ble lest, men pluginens lokale oppsetts-/publiseringsfiler forsvant fra miljøet før prosjektoppsett. Søk i plugincachen fant ingen erstatning. Derfor er dette levert som lokal Next.js-kilde og kjørbar forhåndsvisning; ingen Site ble registrert, og ingenting er publisert offentlig eller privat på en ekstern nettadresse. Dette var en miljøbegrensning, ikke en avvist publiseringsgodkjenning.

## Samlet faglig review

Produkt/UX: Verktøyet hjelper med faktisk størrelse, dokumentert priseksempel og forklarte alternativer; reell tidsbesparelse må brukertestes. Design: selvstendig sammenligningsmerke, med en foreslått familie på `/designoversikt`. Data: feltkilder, separate pris-/fraktbevis, ærlige tomtilstander og kontrollfrister. SEO: liten arkitektur med forskjellige oppgaver. Innhold: bokmål, ingen smakstester eller falske erfaringer. Affiliate/CRO: verdi før klikk og kommersielle data utenfor algoritmen. Tilgjengelighet: semantiske kontroller, synlig fokus og mobilkontroll; formell revisjon gjenstår. Release: passende liten prototype, uten database, innlogging, AI-chat eller oppskriftsarkiv.

**Anbefaling for v1:** Ta denne lille sammenligningen videre til lansering etter at ekte sporingslenker, personvern/drift, aktuell datakontroll og Middagen.no-familien er avklart. Gjennomfør fem oppgavetester. Prioriter deretter bedre prisdekning for tre, fem og seks porsjoner fremfor flere SEO-sider eller kampanjeflater.
