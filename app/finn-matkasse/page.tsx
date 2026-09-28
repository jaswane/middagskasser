import { pageMetadata } from "@/lib/seo";
import { PageIntro } from "@/components/chrome";
import { Selector } from "@/components/selector";
import { affiliateFlags } from "@/lib/commercial";
export const dynamic = "force-dynamic";
export const metadata = {
  ...pageMetadata(
    "/finn-matkasse",
    "Finn matkassen som passer dere",
    "Tre spørsmål om porsjoner, middager og hva dere prioriterer. Få en begrunnet sammenligning.",
  ),
  robots: { index: false, follow: true },
};
export default function Page() {
  return (
    <div className="container selector-page">
      <PageIntro
        eyebrow="MATKASSEVELGEREN"
        title="La oss finne ut hva som passer."
      >
        <p>Tre korte spørsmål om hverdagen deres.</p>
      </PageIntro>
      <Selector flags={affiliateFlags()} />
    </div>
  );
}
