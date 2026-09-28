import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const live = process.env.NEXT_PUBLIC_INDEXABLE === "true";
  return {
    rules: { userAgent: "*", ...(live ? { allow: "/" } : { disallow: "/" }) },
    ...(live
      ? {
          sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "https://middagskasser.no"}/sitemap.xml`,
        }
      : {}),
  };
}
