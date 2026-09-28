import { siteUrl } from "@/lib/seo";
export function PageSchema({ path, title }: { path: string; title: string }) {
  const url = siteUrl + path;
  const graph: object[] = [
    {
      "@type": "WebPage",
      "@id": url + "#page",
      url,
      name: title,
      inLanguage: "nb-NO",
      isPartOf: { "@id": siteUrl + "/#website" },
    },
  ];
  if (path !== "/")
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Forside",
          item: siteUrl + "/",
        },
        { "@type": "ListItem", position: 2, name: title, item: url },
      ],
    });
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": graph,
        }).replace(/</g, "\\u003c"),
      }}
    />
  );
}
