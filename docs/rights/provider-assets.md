# Leverandørenes logoer og merkevarefiler

Register over merkevarefiler fra matkasseleverandører: hvor de kommer fra, hvilket grunnlag vi har for å bruke dem, og hvor de brukes. Kontrollert 08.10.2026.

Regel: Vi bruker ikke en leverandørs logo eller ikon uten et dokumentert rettighetsgrunnlag. Mangler grunnlaget, bruker vi leverandørens navn som tekst. Vi lenker aldri direkte til leverandørens filer (ingen hotlinking); en godkjent fil lagres i `public/brands/` med kilde og kontrolldato her.

At en fil er lastet ned fra leverandørens egen side eller presserom, dokumenterer hvor den kommer fra. Det er ikke i seg selv en tillatelse til å bruke den på et kommersielt sammenligningsnettsted.

## Status per leverandør

| Leverandør | Logo tilgjengelig | Kilde | Rettighetsgrunnlag | Lokal fil | Brukes i dag | Tillatt bruk | Usikkerhet |
| --- | --- | --- | --- | --- | --- | --- | --- |
| HelloFresh | Ja | [Logo på hellofresh.no](https://media.hellofresh.com/w_256,q_100,f_auto,c_limit,fl_lossy/hellofresh_website/logo/Hello_Fresh_Lockup.png) og [favicon](https://www.hellofresh.com/favicons/hellofresh.ico), hentet 28.09.2026. HelloFresh Group tilbyr også merkevarefiler i [presserommet](https://hellofreshgroup.com/en/newsroom/press-material) («Download our brand and media assets»). | **Ikke dokumentert.** Presserommet oppgir ingen bruksvilkår (kontrollert 08.10.2026). Ingen skriftlig tillatelse eller affiliatevilkår om logobruk i prosjektet. | `public/brands/hellofresh-logo.png`, `public/brands/hellofresh.ico` | Ja: logo på `/hellofresh`, ikon ved navnet i sammenligningen og velgerresultatet | Uavklart | Høy. Presserommet er rettet mot presse, ikke kommersielle sammenligningssider. |
| Godtlevert | Ja | [Logo](https://ggfrontendassets.azureedge.net/publicassets/godtlevert/godtlevert-logo-v2.svg), [ikon](https://www.godtlevert.no/icon.svg) og [favicon](https://www.godtlevert.no/favicon.ico), hentet 28.09.2026. Logo også i Godtleverts [Cision-nyhetsrom](https://news.cision.com/no/godtlevert/i/godtlevert-logo,m29792). | **Ikke dokumentert.** Cision-siden viser bare nedlastingsstørrelser, ingen lisens eller bruksvilkår (kontrollert 08.10.2026). Godtleverts presseside `/side/presse` svarte 404. | `public/brands/godtlevert-logo.svg`, `public/brands/godtlevert-icon.svg`, `public/brands/godtlevert.ico` | Ja: logo på `/godtlevert`, ikon ved navnet i sammenligningen og velgerresultatet | Uavklart | Høy. Som for HelloFresh. |
| Kokkeløren | Ikke hentet | – | Ingen | Ingen | Nei. Tekstnavn brukes overalt. | Bare tekstnavn | – |

Opprinnelsen til HelloFresh- og Godtlevert-filene er også beskrevet i [kildekontrollen fra produksjonssprinten](../production-sprint/kildekontroll.md), med sjekksummer i [brand-hashes.json](../production-sprint/brand-hashes.json).

## Åpen beslutning

HelloFresh- og Godtlevert-logoene er i bruk uten dokumentert rettighetsgrunnlag. Det bryter regelen over. To måter å lukke dette på:

1. **Skaffe grunnlaget:** skriftlig bekreftelse fra leverandøren (presse- eller partnerkontakt) eller vilkår i affiliateprogrammet hos Adtraction som tillater logobruk. Legg inn vilkår, dato og omfang i tabellen.
2. **Bytte til tekst:** fjerne logoen på leverandørsidene og ikonene ved navnene. Navnet står allerede som tekst begge steder, så sammenligningen fungerer uten dem.

Eier må velge. Til det er avklart, tas ingen nye leverandørlogoer i bruk.

## Nettstedets egne filer

Favicon, Apple-ikon og delingsbildet (`og.png`) er nettstedets egen merkevare, laget fra PackageOpen-symbolet (Lucide, ISC-lisens) med [generate-brand-assets.cjs](../production-sprint/generate-brand-assets.cjs). Forsidebildet `public/images/middag.jpg` er et illustrasjonsfoto fra Pexels under Pexels-lisensen, uten tilknytning til noen leverandør.
