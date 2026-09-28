import type { MetadataRoute } from "next";
import { indexablePaths, siteUrl } from "@/lib/seo";
export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.NEXT_PUBLIC_INDEXABLE !== "true") return [];
  return indexablePaths.map((path) => ({ url: siteUrl + path }));
}
