# Middagskasser.no — produkt- og designbeslutninger for v1

Beslutningsnotat, 28.09.2026. Dette er prosjektets produktforslag og kvalitetskrav, ikke en rapport fra gjennomførte brukerstudier. Bekreftede leverandørfakta skal hentes fra kildearket og de lokale leverandørdataene. Ikke les et implementeringskrav i dette dokumentet som bevis på at funksjonen allerede er testet eller publisert.

Produktresearch er samlet i [research-leverandorer.md](./research-leverandorer.md). Den dokumenterer planvalg, åtte felles priseksempler og kildekonflikter. Oppgaver og forutsetninger nedenfor må avstemmes med faktiske QA-resultater i leveransen.

**Status:** En liten, lokal high-fidelity prototype er bygget med Next.js og TypeScript. Se faktisk status og testbevis i leveranse-og-qa.md. Produksjonslansering krever en egen sluttkontroll av data, samtykke, lenker og faktisk hosting. Prisfelt som ikke kan verifiseres er `null`, aldri `0` eller en antatt pris. Kommersiell avtaleinformasjon holdes utenfor offentlig innhold og matching.

## A. Produktdefinisjon

Middagskasser.no er en norsk beslutningshjelper som lar husholdninger sammenligne dokumenterte forskjeller mellom matkasser og forstå hvilke alternativer som passer deres hverdag.

Arbeidsløftet er «Finn matkassen som passer dere». Første skjerm skal vise oppgaven, avgrensningen til HelloFresh og Godtlevert og to like tydelige veier: direkte sammenligning og en kort velger. Besøkeren skal kunne ha nytte av siden uten å klikke videre til en annonsør.

## B. Målgrupper og brukssituasjoner

| Gruppe | Situasjon | Beslutning siden hjelper med |
| --- | --- | --- |
| Primær: småbarnsfamilier og par | Vil bruke mindre tid på å bestemme og handle middag | Hva passer antallet som spiser, ukerytmen og prioriteringen? |
| Primær: vurderer HelloFresh mot Godtlevert | Har besøkt én eller begge, men synes vilkår og pris er vanskelige å sammenholde | Hvilke forskjeller er dokumenterte, og hva må sjekkes hos leverandøren? |
| Sekundær: eksisterende kunder | Vurderer bytte eller reaktivering | Er forskjellen verdt et bytte etter at introtilbudet er slutt? |
| Sekundær: større husholdninger | Trenger tilstrekkelige porsjoner og passende antall middager | Finnes en dokumentert konfigurasjon for oss? |

Dette er hypoteser fra briefen. Ingen intervjuer, brukertall eller observerte preferanseandeler er gjennomført eller oppgitt. Før lansering foreslås fem korte oppgavetester med par/familier: finn alternativ for egen husholdning, forklar prisgrunnlaget og gjenfortell hvorfor et resultat ble likt eller ulikt. Mål tid, feil og forståelse; ikke spør bare om de liker designet.

## C. Job-to-be-done

«Når vi vurderer matkasse, vil jeg raskt sammenligne aktuelle alternativer på samme grunnlag, slik at jeg kan velge med forståelse for både kostnad og begrensninger.»

Brukeren skal kunne besvare tre spørsmål før videreklikk: Passer størrelsen? Hva vet vi om pris og abonnement? Hvorfor passer dette alternativet, og hva taler for det andre? Et resultat innen få minutter er et produktmål, ikke en dokumentert tidsbesparelse.

## D. Liten MVP

**Med:** To leverandører, felles sammenligning, tretrinns velger på `/finn-matkasse`, to leverandørsider, én side for HelloFresh mot Godtlevert, metode, kommersiell forklaring, personvern, om, kontakt, 404 og diskret Middagen.no-lenke. Tilbud er valgfri data som produktet fungerer uten. Datadrevne tomtilstander inngår i designet.

**Uten:** Innlogging, AI-chat, profil, abonnement, betaling, oppskrifter, ukemeny, anmeldelser, stjerner, CMS, scraping, datavarehus, postnummerdatabase og brede SEO-klynger. Ingen leverandør tas inn bare for å øke antallet eller fordi den tilbyr provisjon.

Next.js gjør faktainnhold tilgjengelig som HTML. Klientkode begrenses til velger, eventuelle utvidelser av sammenligningen og samtykke. Lokal TypeScript/JSON er tilstrekkelig. Ingen AI-API eller database er nødvendig. En eksportvariant må ha en separat avtalt løsning for `/go/`; serverruter kan ikke antas å følge med statiske HTML-filer.

## E. Informasjonsarkitektur

Tabellen gjelder den ferdige produksjonssiden. Hele prototypen skal være `noindex` inntil lanseringskontrollen er bestått. Ikke sett en uferdig forhåndsvisning som canonical for produksjon.

| Route | Egen oppgave | Indeksering ved lansering | Viktigste internlenker |
| --- | --- | --- | --- |
| `/` | Forstå produktet; sammenligne eller åpne velger | Ja | Begge leverandører, versus, metode |
| `/#sammenligning` | Samme felter og samme konfigurasjon | Del av `/` | Leverandørdetaljer, metode |
| `/finn-matkasse` | Tre spørsmål og forklarbart resultat | Nei; crawlbar noindex | Sammenligning og begge alternativer |
| `/hellofresh` | Forstå HelloFresh på egne premisser | Ja | Godtlevert, versus, metode |
| `/godtlevert` | Forstå Godtlevert på egne premisser | Ja | HelloFresh, versus, metode |
| `/hellofresh-vs-godtlevert` | Avveie reelle forskjeller | Ja | Begge detaljsider og velger |
| `/slik-sammenligner-vi` | Se kriterier, dekning, kildebruk og feilretting | Ja | Kontakt og annonselenker |
| `/annonselenker` | Forstå den kommersielle relasjonen | Ja | Metode og personvern |
| `/om` | Forstå avsender og søsterproduktene | Ja | Kontakt og metode |
| `/kontakt` | Melde feil og kontakte avsender | Ja | Metode |
| `/personvern` | Se faktisk behandling og endre samtykke | Ja | Kontakt |
| `/go/hellofresh`, `/go/godtlevert` | Sentral videreføring til leverandør | Nei | Utgående godkjent destinasjon |
| `/designoversikt` | Interne skjerm-/tilbudstilstander | Nei; crawlbar noindex, utenfor sitemap | Relevant designutkast |
| Ukjent URL | Gi reell HTTP 404 og vei tilbake | Nei | Forside og sammenligning |

Hver indekserbar side får en absolutt canonical til sin egen rene produksjons-URL. Filtervalg og svar skaper ikke egne indekserbare sider. Sitemap inneholder bare indekserbare URL-er som returnerer 200; `lastmod` endres bare ved reell innholdsendring. `/go/`, 404 og prototypeeksempler utelates. Ikke blokker crawling av sider der søkemotoren skal oppdage `noindex`: robots.txt alene hindrer ikke at en URL vises i søk. [Google om indekseringskontroll](https://developers.google.com/search/docs/crawling-indexing/robots/intro).

Kontaktadressen fra briefen skal bare stå på kontaktsiden, aldri i footer, schema, metadata eller globale komponenter. Footer viser en vanlig «Kontakt»-lenke.

## F. Minste robuste datamodell

Skill dokumentert fakta, redaksjonell vurdering og kommersiell konfigurasjon. Ikke legg en udokumentert `bestFor`-etikett inn som om den var et leverandørfaktum. Kilder knyttes til felt, ikke bare til en generell liste nederst.

**Implementert prototype:** `lib/data.ts` bruker `Fact<T>` med direkte kildeobjekt, `reviewAfterDays` og valgfritt forbehold. `Quote` har egen pris- og fraktkilde, `basis` og `addressNote`; åtte like konfigurasjoner er registrert for hver leverandør. `getQuote` krever ferskhet for både pris- og fraktkilden. Pris og oppgitt utvalgsantall har 30 dagers kontrollfrist; øvrige fakta har 90 dager. `lib/commercial.ts` er separat serverkonfigurasjon uten provisjonsbeløp. Modellen nedenfor er en mer eksplisitt videreføring for status, kilde-ID-er og kontrollerte kombinasjoner, ikke en påstand om at alle disse feltene allerede finnes.

```ts
type ProviderId = 'hellofresh' | 'godtlevert';
type DateISO = string;
type Evidence<T> = {
  value: T | null;
  status: 'verified' | 'unknown' | 'conflicting' | 'stale';
  sourceIds: string[];
  checkedAt: DateISO | null;
  reviewAfter: DateISO | null;
  note?: string;
};
type Source = {
  id: string;
  url: string;
  title: string;
  publisher: string;
  checkedAt: DateISO;
};
type Plan = {
  people: number;
  meals: number;
  ordinaryBoxNok: Evidence<number>;
  deliveryNok: Evidence<number>;
  totalBasis: 'observed-checkout' | 'calculated-standard';
  addressContext: string; // kontrollert eksempel eller leveringsforbehold
  note: string; // ordinær standardmeny, ikke intro/premium
};
type Offer = {
  headline: string;
  description: string;
  code?: string;
  validFrom: DateISO | null;
  validUntil: DateISO | null;
  eligibility: string;
  sourceIds: string[];
  checkedAt: DateISO;
  reviewAfter: DateISO;
};
type Provider = {
  id: ProviderId;
  name: string;
  slug: string;
  websiteUrl: string;
  description: string;
  householdSizes: Evidence<number[]>;
  mealsPerWeek: Evidence<number[]>;
  // Kombinasjoner må bekreftes; ikke automatisk kryssprodukt av listene.
  plans: Evidence<Plan[]>;
  weeklyChoice: Evidence<number>;
  chooseMeals: Evidence<boolean>;
  vegetarian: Evidence<boolean>;
  quickMeals: Evidence<boolean>;
  pause: Evidence<boolean>;
  cancellation: Evidence<string>;
  delivery: Evidence<string>;
  strengths: { text: string; basisSourceIds: string[] }[];
  limitations: { text: string; basisSourceIds: string[] }[];
  offer: Offer | null;
};
// Separat server-/driftskonfigurasjon. Ingen provisjon i public data.
type OutboundConfig = {
  provider: ProviderId;
  websiteUrl: string;
  affiliateUrl: string | null;
  network: 'adtraction' | null;
  lastLinkChecked: DateISO | null;
  allowedPlacements: string[];
};
```

Valider URL-er, datoer, gyldighetsrekkefølge, positive beløp og kilde-ID-er ved bygg. `false` betyr et dokumentert nei; `null` betyr ukjent. To listesett beviser ikke at alle kombinasjoner kan kjøpes. Dokumentasjon av en plan må inkludere husholdning, middager, menyvalg, ordinær pris, frakt og dato.

Ukostnad er `ordinaryBoxNok + deliveryNok`; porsjonspris er ukostnad delt på `people × meals`. Beregningen er bare tillatt når begge beløp er kjent og samme konfigurasjon gjelder. Vis ordinær ukostnad tydeligere enn intropris. Mangler frakt, ikke kall et delbeløp totalpris. Dersom ingen sammenlignbar pris er kontrollert, vis «Pris ikke bekreftet — se aktuell pris hos leverandøren» for begge og slå av prisrangering.

Dato for selve researchbesøket er ikke nødvendigvis dato for et bekreftet faktum. Konflikt mellom sider merkes og avgjøres ved ny kontroll av autoritativ bestillingsflyt/vilkår, aldri ved å velge det høyeste eller mest attraktive tallet. Oppdateringsdato settes per felt; en endret overskrift gjør ikke alle priser ferske.

Research 28.09.2026 bekrefter HelloFreshs observerte planvalg med 2 eller 4 porsjoner og Godtleverts med 2–6 porsjoner. Begge har 2–5 middager. Det gir en reell forskjell ved 3, 5 og 6 porsjoner; bruk ordet «porsjoner» der en størrelse ellers kan mistolkes som tilstrekkelig mat til en bestemt familie. [HelloFresh planvalg](https://www.hellofresh.no/plans), [Godtlevert planvalg](https://www.godtlevert.no/velg-matkasse).

For 2 porsjoner og 3 middager dokumenterte researchen HelloFreshs grunnpris 770 kr og levering 79 kr i et eksempel med postnummer 0150. Godtleverts grunnpris var 860 kr; standardfrakt 79 kr er dokumentert separat, mens vilkårene åpner for adresse-/leveringsavvik. Et beregnet Godtlevert-eksempel blir 939 kr mot observert HelloFresh-eksempel 849 kr. Dette er ikke en personlig sluttpris eller en generell prisvinner. UI kan vise eksemplene med synlig metode og forbehold, eller beholde totalpris som ukjent til individuell frakt er avklart. [Godtleverts fraktopplysning](https://tips.godtlevert.no/nb/articles/16068043-avgifter-og-prisjusteringer), [leveringsvilkår](https://www.godtlevert.no/vilkar). Alle åtte felles pakkekombinasjoner og deres forskjeller er i kildearket; blant annet gir 4 × 4 likt standardeksempel, mens 4 × 5 gir lavere Godtlevert-eksempel.

## G. Sammenligningskriterier

| Felt | Hvorfor det hjelper | Publiseringsregel |
| --- | --- | --- |
| Personer og middager | Avgjør om tjenesten passer husholdningen | Bruk bekreftede intervaller og kombinasjoner; håndter større husholdninger eksplisitt |
| Ordinær ukostnad + frakt | Gjør kostnad forståelig etter tilbudsperioden | Samme konfigurasjon, kilde og dato; ellers ukjent |
| Porsjonspris | Enkel avledet sammenligning | Beregnet fra samme total, ingen løse «fra»-priser |
| Utvalg/velge retter | Viser hvor mye beslutningsrom brukeren får | Leverandørens oppgitte antall med forbehold; lik tellemetode før rangering |
| Vegetar | Relevant kostholdspreferanse | Tilgjengelighet er ikke bevis på antall retter eller allergisikkerhet |
| Raske retter | Relevant i en travel uke | Dokumentert kategori eller konkret tidsgrense; ikke generell lovnad om spart tid |
| Pause/oppsigelse | Avklarer abonnement og planlegging | Beskriv frist og fremgangsmåte når verifisert; «ingen binding» betyr ikke at en påbegynt leveranse kan avbestilles |
| Levering | Avgjør faktisk tilgjengelighet | Be brukeren sjekke eget postnummer hos leverandøren; ingen landsdekkende påstand uten dokumentasjon |
| Tilbud | Kan påvirke første bestilling | Separat fra normalpris, bare aktivt og dokumentert |

Familievennlighet, smak, kvalitet, bærekraft og «minst mulig planlegging» skal ikke gis tallscore uten en konkret metode. App, leveringsdager og faste vegetar-antall utelates fra første tabell dersom de ikke gir nok verdi til å forsvare vedlikehold. Korte begrensninger vises ved siden av styrkene.

## H. Velger: tre steg og forklarbar matching

Velgeren er frivillig og ligger på `/finn-matkasse`. Brukeren kan alltid gå til sammenligningen, gå tilbake eller endre svarene etter resultatet. Implementeringen bruker native radioknapper gruppert med `role="radiogroup"` og en tilknyttet stegtittel. Ingen svar er forhåndsvalgt. Fokus flyttes til ny stegtittel/resultat; svar beholdes når man går tilbake. Stegindikatoren sier «Steg 1 av 3» i tekst. Faktisk tastatur- og skjermleseroppførsel må bekreftes i QA.

Implementert spørsmålssett:

1. **Hvor mange porsjoner trenger dere?** 2, 3, 4, 5, 6 eller 7+. Teksten forklarer at behovet varierer med alder og appetitt. `7+` representeres som 7 og har ingen dokumentert enkeltkassematch i dagens data.
2. **Hvor mange middager i uken?** 2, 3, 4 eller 5. Samme antall brukes hos begge.
3. **Hva betyr mest for dere?** «Lavere normalpris», «Flere retter å velge mellom» eller «Ingen klar prioritet».

**Implementert scoring, versjon 1:** Størrelse og antall middager er kompatibilitetsvilkår, ikke poeng. En kjent størrelse utenfor tilbudet gir `compatible: false`; manglende fersk bekreftelse gir `null`; dokumentert støtte gir `true`. Bare støttede størrelser kan få ett preferansepoeng. Datamodellen bruker i dag separate lister for størrelser og middager. Hvis framtidige planer ikke tillater hele kryssproduktet, må eksplisitte kombinasjoner innføres før disse listesettene brukes som bevis.

- **Pris:** Begge leverandører må ha en fersk pris for identiske porsjoner/middager og kjent frakt. Pris- og fraktkilde kontrolleres separat. Lavere total gir ett poeng når totalene er ulike; lik pris gir ingen preferansepoeng. Resultatet sier «lavere pris i dette eksemplet», viser differansen og forklarer HelloFreshs postnummereksempel og Godtleverts beregnede standardfrakt. Pris for 3, 5 og 6 porsjoner er ukjent. Ingen beløp interpoleres.
- **Utvalg:** Begges oppgitte utvalgsantall må være ferske. Større oppgitt antall gir ett poeng i denne sammenligningen av to leverandører. Resultatet sier at det er leverandørens opplysning, at eldre sider motsier tallene, og at flere valg ikke beviser bedre smak eller kvalitet. Dette er en forsiktig preferanse på oppgitt omfang, ikke en uavhengig telling av brukerens tilgjengelige retter.
- **Ingen klar prioritet:** Ingen preferansepoeng. Begge alternativer forblir synlige. Felles kategorier som vegetar, raske retter og pause skal ikke skape en vinner.

Resultatene beholdes i alfabetisk rekkefølge, med et merket preferansetreff fremfor en omrangert toppliste. Provisjon, annonselenke og konverteringssannsynlighet er utilgjengelige for matchfunksjonen. Ingen aktiv pris-/utvalgssammenligning er tillatt når en nødvendig kilde er foreldet. Den implementerte maksimalscoren er ett, aldri en stjernekarakter eller et prosenttall.

**Resultattilstander:**

- Begge matcher uten preferanseforskjell: «Begge kan være aktuelle for dere.» Vis hva begge støtter og begge lenker.
- Én dokumentert match: «[Leverandør] har den valgte kassestørrelsen.» Ikke lov tilgjengelig levering før postnummerkontroll.
- Pris prioritert, men sammenlignbar pris mangler: «Vi kan ikke sammenligne prisen ennå.» Forklar hvilket grunnlag som mangler.
- Ingen fersk bekreftet størrelse, men minst én er ukjent: «Vi trenger ferskere data for å gi et svar.» Ingen reservevinner.
- Alle størrelser dokumentert utenfor tilbudet: «Ingen dokumentert match for denne størrelsen.» Ikke vis salgs-CTA for en kjent inkompatibel pakke.

Ved 3 porsjoner opplyses det at fire porsjoner fra HelloFresh kan være et alternativ med rester, men dette regnes som en annen størrelse og pris. Prisoverskrift brukes først når begge størrelser er støttet; et eneste kompatibelt alternativ beskrives med kassestørrelsen, ikke som generell prisvinner.

Vis kriteriene under resultatet, tilby «Endre svar», lenk til alternativet og plasser kommersiell CTA etter begrunnelsen. Unngå «3 av 4 prioriteringer» hvis bare tre spørsmål er stilt eller noen felt er ukjente.

## I. Designretning

Merket skal føles som en norsk redaksjonell hjelpetjeneste: stor typografi, rolig papirflate, korte forklaringer, tydelige skillelinjer og god plass rundt sammenligninger. Et rent ordmerke med et enkelt kasse-/serviseelement kan utvides til en familie. Ingen stjerner, medaljer eller «best i test» som dekorasjon.

| Rolle | Prototypevalg | Bruk |
| --- | --- | --- |
| Bakgrunn | `#fbfaf7` | Varm papirhvit flate |
| Tekst | `#182b2b` | Mørkt blekk, brødtekst og tabeller |
| Egen aksent | `#304dcc` | Kobolt, aktive valg og primære handlinger |
| Varm detalj | `#efc667` | Begrenset fremheving, med mørk tekst |
| Display | Georgia | Store, tydelige overskrifter |
| Grensesnitt | Arial | Kompakt og lesbar sammenligning |

Dette er faktiske prototypevalg, ikke en påstand om Middagen.no sine gjeldende designverdier. Georgia/Arial krever ingen ekstern fontforespørsel. Eventuelle nye fonter bør selvhostes og lastes med begrenset antall vekter.

Komponenter: åpen hero med fotografi, rettlinjet sammenligningsfelt, lavmælt faktaboks, kilde/dato, tydelig radiogruppe, nøkterne knapper med svak avrunding og informativ tomtilstand. Foto skal være generisk middag, ikke utgis for en dokumentert rett eller leveranse fra en partner. Foreløpig bildevalg kan skiftes uten å endre innholdsarkitekturen.

Desktop bruker en lesbar innholdsbredde og to leverandørkolonner. Mobil bygges som kriteriegrupper der begge verdier vises for hvert kriterium, med gjentatte leverandørnavn ved behov. Hovedtabellen skal kunne forstås ved 320–390 px uten horisontal scrolling. Ingen automatisk kortkarusell. Navigasjon, fokus, kontrast, zoom og treffområder verifiseres visuelt; farge alene kommuniserer ikke status.

## J. Forholdet til Middagen.no

**Bekreftet av eier:** Samme eierskap, to ulike brukeroppgaver. **Ikke verifisert:** Middagen.no sin eksisterende typografi, farger, knapper eller layout. Åpning av `https://middagen.no` feilet både i webverktøyet og i nettleser med `ERR_CONNECTION_REFUSED`. Dette er et tilgangsfunn fra denne økten, ikke bevis på at nettstedet er permanent nede.

Det foreslåtte familie-DNA-et er papirbakgrunn, samme skrifthierarki, varm matfotografi, faste mellomrom og gjenkjennelige knappe-/ikonprinsipper. Middagskasser.no bruker kobolt og mer strukturert faktapresentasjon. Middagen.no kan beholde en varmere, mer spontan retning. Samordning mot faktisk eksisterende merkevare er en åpen designkontroll før endelig låsing; prototypen hevder ikke at denne er bestått.

Krysslenken får en egen nytte: «Vil dere heller lage middag selv? Få middagstips hos Middagen.no.» Vis en avsenderforklaring om søsterproduktet. Den motsatte lenken er et senere forslag til Middagen.no; ingen endring der er gjort som del av dette utkastet.

## K. High-fidelity prototype og skjermdekning

Det lokale nettstedet er selve designutkastet. Skjermene kan være responsive varianter eller innholdstilstander, og trenger ikke 16 separate routes.

| Skjermkrav | Plassering/tilstand |
| --- | --- |
| Forside desktop og mobil | Responsiv `/` |
| Direktesammenligning og mobil sammenligning | Samme faktasett i `/` og versus-siden |
| Velgersteg og resultat | `/finn-matkasse`, med tilbake/endre svar |
| HelloFresh og Godtlevert | Egen route for hver |
| HelloFresh vs Godtlevert | Egen route med avveininger |
| Aktivt tilbud | Komponentdesign med dokumentert tilbud dersom tilgjengelig |
| Utløpt/ingen tilbud | Samme komponent med nøytral pris-/leverandørlenke |
| Metode og affiliateinformasjon | Egne sider, forklaring også nær CTA |
| Middagen-krysslenke | Diskret seksjon med konkret alternativ |
| Header/footer og 404 | Felles navigasjon og ekte feilsidestatus |

En aktiv tilbudstilstand kan demonstreres som tydelig merket designeksempel uten publisert rabattpåstand. Slike testdata skal aldri importeres i produksjonsdata, indeks eller schema. Ved manglende verifiserbart tilbud viser det offentlige utkastet tomtilstanden. Endelig QA-rapport skal skille mellom «bygget», «manuelt sett» og «testet».

## L. Affiliate og tillit

Eier har bekreftet aktive kommersielle relasjoner i september 2026. Dette erstatter ikke verifisering av aktuelle produktvilkår, lenker eller tilbud. Provisjonsbeløp skal ikke publiseres, inngå i data som sendes til klienten eller påvirke visningsrekkefølge. Standardrekkefølgen er fast og forklart, for eksempel alfabetisk, og må brukes konsekvent.

På sider med kommersielle lenker brukes en synlig opplysning før første slik lenke, med ordet «Annonse» og navngitte partnere. Hver kommersiell CTA merkes «Annonselenke». Foreslått forklaring: «Vi kan få provisjon når du bestiller gjennom annonselenkene våre. Det øker ikke prisen din. Provisjonen påvirker ikke sammenligningen.» Det siste prisutsagnet må være i samsvar med gjeldende partneroppsett. Ingen gebyr legges på av Middagskasser.no.

Tydelig kommersiell identifikasjon og egne lenkemerker følger prinsippene i [Forbrukertilsynets veiledning](https://www.forbrukertilsynet.no/wp-content/uploads/2017/12/Merking-av-reklame-i-sosiale-medier-kort-versjon.pdf). Veiledningen gjelder sosiale medier/blogg; bruken som designprinsipp her er vår vurdering. Dette notatet er ikke en juridisk godkjenning av den endelige implementeringen.

Dokumentasjon av faktiske markedsføringspåstander må foreligge når de brukes. Dette gir en konkret grunn til å kreve kilder før en pris, produktfordel eller sammenligningspåstand publiseres. [Markedsføringsloven § 3](https://lovdata.no/lov/2009-01-09-2/§3).

CTA-er kommer etter relevant fakta: nederst i sammenligningskolonnen, etter resultatets begrunnelse og etter leverandørens pris/vilkår. Bruk «Se matkassene hos …» eller «Se aktuell pris hos …». «Se tilbud» brukes bare når et reelt aktivt tilbud er dokumentert. Ingen nedtellere eller påstått knapphet.

Sentral `/go/{provider}`-modell bruker tillatt leverandør-ID og tillatte `placement`-verdier. Produksjon kan svare med midlertidig redirect og `X-Robots-Tag: noindex, nofollow`; ved statisk eksport må tilsvarende sentral, merket mellomside eller hostingredirect etableres. Aldri godta en vilkårlig `url`-parameter som destinasjon. Ingen personopplysninger i sub-ID, URL eller logger. Manglende affiliate-URL gir en dokumentert vanlig leverandørlenke, ikke en oppdiktet sporingslenke.

Relevante kommersielle ankerlenker har `rel="sponsored nofollow"`. Kildelenker behandles som redaksjonelle kilder. Google foretrekker `sponsored` for betalte lenker og aksepterer også `nofollow`. [Googles lenkedokumentasjon](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links).

Senere inntekter: flere relevante leverandører gjennom samme dokumentasjonskrav; tydelig avgrenset annonseplass uten rangeringseffekt; egen matematisk sammenligning av handle selv når prisgrunnlaget holder; separate utstyrsguider ved reell nytte. Displayannonser vurderes først ved passende trafikk og plasseres utenfor beslutningsinformasjonen. Ingen av disse utvidelsene er del av v1.

## M. SEO og AI-søk

Søkeord er hypoteser, ikke målt etterspørsel. Det er ikke innhentet søkevolum, SERP-analyse eller Search Console-historikk for domenet. Undersøk Norge/bokmål, resultattyper, leverandørdominans og faktisk brukeroppgave før flere landingssider bygges.

| Side | Hypotese om søkeintensjon | Tittelforslag | Beskrivelsesretning |
| --- | --- | --- | --- |
| `/` | matkasse, matkasser, sammenligne matkasser | Hvilken matkasse passer dere? · Middagskasser.no | Sammenlign HelloFresh og Godtlevert på de samme feltene, eller bruk den korte velgeren. |
| `/hellofresh` | HelloFresh pris/vilkår/hvem passer | HelloFresh: størrelse, valg og vilkår · Middagskasser.no | Forklar hva som er bekreftet, hva som må sjekkes og alternativet Godtlevert. |
| `/godtlevert` | Godtlevert pris/vilkår/hvem passer | Godtlevert: størrelse, valg og vilkår · Middagskasser.no | Samme ramme og detaljnivå som HelloFresh. |
| `/hellofresh-vs-godtlevert` | konkret leverandørvalg | HelloFresh eller Godtlevert? Sammenlign forskjellene | Avveininger på størrelse, prisgrunnlag, valg og fleksibilitet, uten generell vinner. |
| `/slik-sammenligner-vi` | metode og troverdighet | Slik sammenligner vi · Middagskasser.no | Åpen dekning, like kriterier, kilder og oppdateringspraksis. |

Leverandørsidene forklarer én tjeneste; versus-siden sammenfatter valgets avveininger; forsiden er verktøyet. Metadata skal beskrive innholdet som faktisk finnes, uten årstall som automatisk fornyes. Ikke lov pristall i utdrag hvis siden bare har ukjent pris. `lang="nb"`, én beskrivende H1, beskrivende lenketekst og semantiske tabeller hjelper både lesere og maskiner.

**Ikke bygg ennå:** `/matkasse-for-2`, `/matkasse-for-familie`, `/billig-matkasse`, `/vegetarisk-matkasse`, `/matkasse-pris`, `/matkasse-eller-handle-selv` og `/matkasse-tilbud`. De trenger dokumentert egen oppgave, tilstrekkelig unik data og et vedlikeholdsansvar. «Beste matkasse» behandles som behovsavhengig sammenligning; vi lager ingen udokumentert totalvinner.

Schema: `WebSite` og `Organization` med faktisk avsender, `WebPage` på relevante sider og `BreadcrumbList` der stien er synlig. En synlig sammenligningsliste kan beskrives med `ItemList` uten at posisjon utgis for kvalitet. Ingen `Product`, `Review` eller `AggregateRating` i v1. Schema skal samsvare med synlig innhold; riktig syntaks gir ingen garanti for søkeresultatutseende. [Googles schema-regler](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

Synlige FAQ-er kan være nyttige uten FAQ-schema. Googles FAQ-utvidelser er i hovedsak begrenset til autoritative helse- og myndighetssider, så FAQ-schema er ikke et forventet veksttiltak her. [Google om FAQ-resultater](https://developers.google.com/search/blog/2023/08/howto-faq-changes).

AI-søk får kort svar først, tydelige selvstendige fakta, konfigurasjon ved pris, konkret kildelenke, kontrollert dato og eksplisitt usikkerhet. Google krever ingen egen AI-fil eller spesiell schema-type for sine AI-søkefunksjoner. [Google om AI-funksjoner](https://developers.google.com/search/docs/appearance/ai-features). Ingen trafikk- eller siteringsløfter.

## N. Samtykke, analyse og KPI-er

V1 bør bruke GA4 bare etter aktivt samtykke til analyse. Ingen GA-script, cookies eller analyseforespørsler før samtykke; ingen lagring av hendelser for senere ettersending ved et nei. Produktet fungerer fullt uten analyse. Uten reell GA4-konfigurasjon er integrasjonen avslått, ikke simulert som aktiv måling.

**Kodestatus ved review 28.09.2026:** Integrasjonen er betinget av `NEXT_PUBLIC_GA_ID` og samtykkevalget `yes`. Eksempelkonfigurasjonen har tom ID, så GA4 er ikke aktivert. Det finnes kodepunkter for velger, sammenligning, utgående lenker og søsterprodukt. Hendelsestabellen nedenfor er den foreslåtte kontrakten; alle parametere og hendelser er ikke ferdig implementert. Aktivering krever kontroll av tilbaketrekking, rutebaserte sidevisninger, synlighetsmåling etter samtykke og personverntekst. Ingen nettverkskontroll er gjennomført i dette kodereviewet.

Banneret forklarer formål og mottaker og gir «Godta analyse» og «Avvis» med likeverdig oppmerksomhet i samme lag. Ingen forhåndsvalg. «Endre samtykke» er tilgjengelig senere; tilbaketrekking stopper videre måling og håndterer analyse-cookies. Personvern må beskrive faktisk behandlingsansvarlig, formål, behandlingsgrunnlag, datatyper, mottakere, oppbevaring og relevante overføringer. Samtykkeversjon og valgt status kan lagres med avgrenset levetid for å respektere valget. Dette er konkrete produktkrav basert på [Datatilsynets veiledning](https://www.datatilsynet.no/personvern-pa-ulike-omrader/internett-og-apper/bruk-av-informasjonskapsler-og-andre-sporingsteknologier/?print=true).

Analyse-samtykke gir ikke automatisk samtykke til alle former for markedsføringssporing. Før Adtraction tas i bruk kontrolleres den faktiske lenkens/pikselens databehandling separat. Ikke legg nettverkspiksler på siden som del av vanlig lenkeoppsett. Et vanlig brukerinitiert utgående klikk må fungere selv om analyse er avslått.

| Hendelse | Utløses én gang per relevant handling | Tillatte parametere |
| --- | --- | --- |
| `selector_start` | Første aktive start | `placement`, `page` |
| `selector_answer` | Bekreftet svar på steg | `step`, grov `answer_id` uten fritekst |
| `selector_complete` | Nytt beregnet resultat | `result_type`, `method_version` |
| `comparison_view` | Sammenligning faktisk synlig | `page`, `placement` |
| `comparison_expand` | Åpning av ekstra felt | `section`, `page` |
| `provider_view` | Leverandørside vist | `provider`, `page` |
| `offer_view` | Aktivt dokumentert tilbud synlig | `provider`, `offer_type` |
| `affiliate_click` | Brukeren aktiverer kommersiell lenke | `provider`, `placement`, ren `page`, `offer_type` |
| `sibling_site_click` | Middagen-lenke aktiveres | `placement`, `page`, `direction` |

Tillat bare kontrollerte enum-verdier. Ingen e-post, postnummer, allergi, tekstsvar, rå referer/URL-parametre eller identifikator for brukerprofil. Ikke dupliser `affiliate_click` både på CTA og redirect. Affiliate-konverteringer fra nettverket analyseres adskilt fra redaksjonell match og bare etter avklart databehandling.

KPI-er: velgerstarter / samtykkende forsideøkter; fullføringer / starter; andel delte og uavklarte resultater; sammenligningsbruk; leverandørvisninger; utgående CTR per synlig plassering; søsterproduktklikk. KPI-ene beskriver bare samtykkende trafikk og kan være skjeve. Ingen ønskede prosentmål er dokumenterte baselineverdier. Først kartlegges bruk og forståelse, deretter settes forbedringsmål. Et klikk alene er ikke bevis på godt brukerutfall.

## O. Vedlikehold og ansvar

| Datatype | Primærkilde | Foreslått intervall | Fallback når kontroll svikter |
| --- | --- | --- | --- |
| Ordinær pris og frakt | Leverandørens bestillingsflyt for samme plan | Minst månedlig og ved kjent endring | Beløp skjules som aktuell pris; ingen prisrangering |
| Aktivt tilbud | Aktuell tilbudsside + vilkår | Ukentlig mens det vises, ved oppstart/utløp og før kampanje | Skjul tilbud; behold vanlig leverandørinfo |
| Utvalg og planstørrelser | Gjeldende primærside/bestillingsflyt | Månedlig for skiftende tall | Merk ukjent/konflikt, ingen udokumentert match |
| Pause, oppsigelse, levering | Gjeldende hjelpesider/vilkår | Kvartalsvis og ved kjent endring | Henvis til leverandør og oppgi hva som ikke er bekreftet |
| Utgående lenker | Leverandør/avtaleplattform | Månedlig og ved hver lenkeendring | Direkte godkjent leverandørlenke |
| Kommersiell avtale | Eierens nettverkskonto | Månedlig/ved varsel | Deaktiver kommersiell konfigurasjon |
| SEO/indeksering | Search Console etter lansering | Månedlig teknisk; kvartalsvis innhold | Rett feil; ikke opprett tynne sider |

En navngitt redaktør må eie kontrollisten ved lansering. Datavalidering kan varsle om `reviewAfter`, men erstatter ikke manuell kildekontroll. Intervallene er redaksjonelle forslag, ikke automatiske garantier for riktighet. Et utløpt tilbud skjules med dato-logikk også mellom kontroller. Et tilbud uten kjent sluttdato må ha kort kontrollfrist, ellers skjules det. Feil rapporteres via kontaktsiden, korrigeres i sentrale data og får en reell endringsnotis når brukeren kan ha blitt berørt.

## P. QA og samlet sluttkontroll

Dette er akseptansekriterier; faktiske testresultater må føres i en separat leveranserapport.

- **Produkt/UX:** En førstegangsbruker forstår at bare to leverandører sammenlignes. Direkte sammenligning krever ikke velger. Resultatet viser begrunnelse, begrensninger og et alternativ.
- **Data:** Alle tall/påstander har kilde og kontrollstatus. Ukjent blir ikke `false` eller `0 kr`. Like planvilkår kreves for prisdifferanse. Datokonflikter og utløp prøves med kontrollerte testverdier.
- **Velger:** Tastaturbruk, tilbake/start på nytt, samme svar gir samme resultat, delt resultat, ukjent pris, størrelse uten støtte, varierende antall middager og uavklart kombinasjon testes. Algoritmen kan ikke lese kommersielle beløp.
- **Design/mobil:** 320, 390, 768 og 1440 px; lange norske ord; 200 % zoom; begge verdier synlige for hvert kriterium; ingen skjult horisontal tabell. Ingen rabattdominans på første skjerm.
- **Tilgjengelighet:** Logiske overskrifter, tabelloverskrifter, labels/legend, synlig fokus, statusmeldinger, beskrivende lenker, billedalternativ, normal tekstkontrast og minimum gode trykkflater. Test relevant flyt med tastatur og skjermleser.
- **Affiliate/CRO:** Synlig annonseforklaring før første kommersielle lenke; lenkemerke ved CTA; korrekt sentral destinasjon; tillatt placement; ingen åpen redirect; ukjent/utløpt tilbud sier ikke «aktivt tilbud».
- **Personvern:** Nettverksfanen viser ingen GA4-kall før aksept eller etter avvisning. Test gjenbesøk, endring og tilbaketrekking. Sjekk lokal lagring og cookies. Ingen kontaktadresse utenfor kontaktsiden.
- **SEO:** Egen H1/title/canonical; reell 404; produksjonssitemap uten `/go/`; noindex på prototype; JSON-LD stemmer med synlig tekst; ingen ubegrunnede stjerner, review eller priser.
- **Ytelse/sikkerhet:** Optimalisert bilde med dimensjoner, begrenset klientkode, ingen hemmeligheter i klientbundle, validerte URL-er og ingen innholdsinjeksjon fra query. LCP ≤ 2,5 s, INP ≤ 200 ms og CLS ≤ 0,1 er foreslåtte mål, ikke målte resultater.
- **Release:** Build/typecheck passerer; manuell gjennomgang av kritiske desktop-/mobilflyter; kjente begrensninger står i leveransen. Planlagt kontra implementert analytics, hosting og affiliate er tydelig skilt.

Sluttmøtet kan gjøres som en kort faglig gjennomgang: produktleder spør om valget ble enklere; UX om tidsbruk og friksjon; design om selvstendig merkevare; data om kildebelegg; SEO om hver sides oppgave; innhold om naturlig språk; affiliate om merking; CRO om fakta før CTA; tilgjengelighet om tastatur/mobil; release om liten scope og faktiske testbevis. Et faglig agentreview er ikke en ekstern brukertest eller juridisk godkjenning.

## Q. Fem viktigste risikoer

1. **Utdatert eller usammenlignbar pris svekker tilliten.** Tiltak: samme konfigurasjon, feltkilder, kontrollfrister og en ærlig tomtilstand.
2. **To leverandører gir for lite forskjell til en troverdig velger.** Tiltak: delte treff, konkrete kompatibilitetsregler og avklaringer; ikke tving fram en vinner.
3. **Siden fremstår som provisjonsstyrt.** Tiltak: fakta før klikk, synlige begrensninger, forklarte rekkefølger, kommersielle data adskilt fra match og samme kriterier for alle.
4. **Drift/SEO utvides raskere enn dokumentasjonen tåler.** Tiltak: lite routesett, ansvarlig redaktør, ingen nye sider uten selvstendig verdi, oppdateringskø før innholdsproduksjon.
5. **Designfamilie og faktisk mobilnytte blir antatt.** Tiltak: avstem med Middagen.no når det er tilgjengelig, test sammenligningen på liten skjerm og gjennomfør reelle oppgavetester før designet låses.

## R. Minste v1 som er verdt å lansere

Lanser én tydelig forside med den samme troverdige sammenligningen som brukes på detaljsidene, en trestegs velger som kan gi delt resultat, to nyttige leverandørsider, én konkret versus-side og de nødvendige tillitssidene. Hold tilbud valgfritt, slå av prisrangering uten ferske sammenlignbare beløp, og la vanlig leverandørinformasjon fungere før kommersielle lenker aktiveres.

Før offentlig lansering avklares reelle lenker, avsenderopplysninger, samtykkeoppsett, produksjonsadresse og den visuelle koblingen til Middagen.no. Første produktforbedring bør være kontrollert prisdekning for tre, fem og seks porsjoner og en liten runde oppgavetesting. Åtte felles konfigurasjoner for to og fire porsjoner er allerede dokumentert i researchen. Flere leverandører og SEO-sider kommer først når de gjør beslutningen bedre.

**Samlet anbefaling:** Gjør Middagskasser.no til en liten og vedlikeholdbar sammenligning som er presis om det den vet og tydelig om det brukeren må sjekke, med verdi før affiliateklikk.

