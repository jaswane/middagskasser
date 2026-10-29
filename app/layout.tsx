import type { Metadata } from "next";
import { Header, Footer } from "@/components/chrome";
import { Analytics } from "@/components/analytics";
import "./globals.css";
const indexable = process.env.NEXT_PUBLIC_INDEXABLE === "true";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://middagskasser.no",
  ),
  title: {
    default: "Hvilken matkasse passer dere? | Middagskasser.no",
    template: "%s | Middagskasser.no",
  },
  description:
    "Sammenlign HelloFresh og Godtlevert på samme kriterier. Se hva som er dokumentert, hva prisen gjelder, og hvilken matkasse som passer dere.",
  robots: { index: indexable, follow: indexable },
  // Stable icon URLs: Google wants a favicon URL that does not change, and the
  // content hash Next.js adds to file-based icons changed with a Next upgrade.
  // public/favicon.ico, app/icon.svg and app/apple-icon.png all revalidate on
  // every request, so a changed icon still reaches browsers.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: { locale: "nb_NO", siteName: "Middagskasser.no", type: "website" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nb" data-scroll-behavior="smooth">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://middagskasser.no/#publisher",
                  name: "Swane Creative",
                },
                {
                  "@type": "WebSite",
                  "@id": "https://middagskasser.no/#website",
                  name: "Middagskasser.no",
                  alternateName: ["Middagskasser", "middagskasser.no"],
                  url: "https://middagskasser.no/",
                  inLanguage: "nb-NO",
                  publisher: { "@id": "https://middagskasser.no/#publisher" },
                },
              ],
            }).replace(/</g, "\\u003c"),
          }}
        />
        <a className="skip-link" href="#hovedinnhold">
          Hopp til innhold
        </a>
        <Header />
        <main id="hovedinnhold">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
