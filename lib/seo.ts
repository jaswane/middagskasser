import type { Metadata } from "next";
import { editorialProviders } from "./data.ts";
export const siteUrl = "https://middagskasser.no";
export const indexablePaths = [
  "/",
  "/hellofresh",
  "/godtlevert",
  "/hellofresh-vs-godtlevert",
  "/slik-sammenligner-vi",
  "/om",
  "/kontakt",
  "/personvern",
  "/annonselenker",
  "/matkasser",
  "/beste-matkasse",
  "/billigste-matkasse",
  "/levering",
  // Editorial provider pages are ordinary indexable provider pages.
  ...editorialProviders.map((e) => "/" + e.id),
];
// Social networks cache the sharing image per URL. The version is the first 8
// hex characters of the SHA-256 of public/og.png (printed by
// docs/production-sprint/generate-brand-assets.cjs and checked by a test).
export const ogImage = "/og.png?v=0f281426";
export function pageMetadata(
  path: string,
  title: string,
  description: string,
): Metadata {
  const fullTitle = `${title} | Middagskasser.no`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      locale: "nb_NO",
      siteName: "Middagskasser.no",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Middagskasser.no – Hvilken matkasse passer dere?",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}
