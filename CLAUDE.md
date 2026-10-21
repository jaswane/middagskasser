@AGENTS.md

## Prosjektinstruks: Middagskasser.no

Les før du endrer noe:

- `README.md`: status, ruter, ferskhetsregler og vedlikehold
- `docs/produktstrategi.md`: produktgrenser, informasjonsarkitektur og hva som ikke skal bygges
- `docs/research-leverandorer.md`: kilder, priskontroller, leveringsprøven og rutinene
- `docs/rights/provider-assets.md`: ingen leverandørlogoer uten dokumentert rettighetsgrunnlag
- `docs/drift.md`: tilganger, gjenoppretting, GA4 og AI-crawlere

Skrivestandard: eiers globale `WRITING.md` (`~/.claude/WRITING.md`), inkludert Human Writing Pass for all synlig tekst. Kvalitetsramme: «Nettsider som fortjener besøket 2026 – 50 kontrollpunkter» (eiers PDF, ikke i repoet).

Faste regler:

- Endre aldri pris-, frakt-, utvalgs- eller leveringsdata, og aldri `checkedAt`, uten en faktisk ny kontroll hos leverandøren.
- Ikke endre GA4-admin, indeksering, affiliate-URL-er eller robots-tilgang for AI-trening uten eiers godkjenning.
- Lokal test: port 3000 kan være opptatt av et annet prosjekt. Bruk for eksempel `npx next start -p 3100` og `TEST_BASE_URL`.
