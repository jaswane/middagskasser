import type { Metadata } from "next";
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
];
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
          url: "/og.png",
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
      images: ["/og.png"],
    },
  };
}
