export function launchErrors(
  env: Record<string, string | undefined>,
): string[] {
  const errors: string[] = [];
  if (env.NEXT_PUBLIC_SITE_URL !== "https://middagskasser.no")
    errors.push("Sett produksjonsdomene til https://middagskasser.no.");
  // Analytics is optional. Once a GA4 ID is set, it and the retention that the
  // privacy page states must both be valid.
  const gaId = env.NEXT_PUBLIC_GA_ID;
  if (gaId?.trim()) {
    if (!/^G-[A-Z0-9]{6,20}$/.test(gaId))
      errors.push(
        "NEXT_PUBLIC_GA_ID: satt verdi er ikke en gyldig GA4-måle-ID.",
      );
    if (!["2", "14"].includes(env.GA_RETENTION_MONTHS || ""))
      errors.push(
        "Bekreftet GA4-lagringstid må være 2 eller 14 måneder når GA4 er aktivert.",
      );
  }
  // Empty affiliate URLs are a valid launch: /go/ then uses the approved
  // eButikker.no fallback. A value that is set must be a real Adtraction link.
  for (const key of ["HELLOFRESH_AFFILIATE_URL", "GODTLEVERT_AFFILIATE_URL"]) {
    const raw = env[key]?.trim();
    if (!raw) continue;
    try {
      const url = new URL(raw);
      if (
        url.protocol !== "https:" ||
        url.username ||
        url.password ||
        !["track.adtraction.com", "adtr.co"].includes(url.hostname)
      )
        throw new Error();
    } catch {
      errors.push(`${key}: satt verdi er ikke en gyldig Adtraction-lenke.`);
    }
  }
  for (const key of ["PRIVACY_OPERATIONS", "PRIVACY_CONTACT_RETENTION"])
    if (!env[key]?.trim())
      errors.push(`${key}: bekreftede personvernopplysninger mangler.`);
  if (env.LAUNCH_VERIFIED !== "true")
    errors.push(
      "Lanseringskontroll i faktisk drift er ikke bekreftet (LAUNCH_VERIFIED).",
    );
  return errors;
}
