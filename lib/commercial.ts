import type { ProviderId } from "./data";
// Commercial configuration stays server-side, separate from editorial facts and scoring.
const official: Record<ProviderId, string> = {
  hellofresh: "https://www.hellofresh.no/",
  godtlevert: "https://www.godtlevert.no/",
};
export function destination(
  id: ProviderId,
  env: Record<string, string | undefined> = process.env,
) {
  const raw =
    id === "hellofresh"
      ? env.HELLOFRESH_AFFILIATE_URL
      : env.GODTLEVERT_AFFILIATE_URL;
  if (raw) {
    try {
      const u = new URL(raw);
      if (
        u.protocol === "https:" &&
        !u.username &&
        !u.password &&
        ["track.adtraction.com", "adtr.co"].includes(u.hostname)
      )
        return { url: u.toString(), affiliate: true };
    } catch {}
  }
  return { url: official[id], affiliate: false };
}
export function redirectTarget(
  id: ProviderId,
  placement: string | null,
  env?: Record<string, string | undefined>,
) {
  const dest = destination(id, env);
  const target = new URL(dest.url);
  if (dest.affiliate) {
    const safePlacement = [
      "comparison",
      "selector_result",
      "provider_bottom",
    ].includes(placement || "")
      ? placement
      : "direct";
    // Adtraction requires a deeplink's url parameter to be last.
    const deeplink = target.searchParams.get("url");
    target.searchParams.delete("url");
    target.searchParams.set("epi", `${id}_${safePlacement}`);
    if (deeplink) target.searchParams.set("url", deeplink);
  }
  return target.toString();
}
export function affiliateFlags() {
  return {
    godtlevert: destination("godtlevert").affiliate,
    hellofresh: destination("hellofresh").affiliate,
  };
}
