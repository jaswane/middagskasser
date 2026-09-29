export function launchErrors(
  env: Record<string, string | undefined>,
): string[] {
  const errors: string[] = [];
  if (env.NEXT_PUBLIC_SITE_URL !== "https://middagskasser.no")
    errors.push("Sett produksjonsdomene til https://middagskasser.no.");
  if (!/^G-[A-Z0-9]{6,20}$/.test(env.NEXT_PUBLIC_GA_ID || ""))
    errors.push("Reell GA4-måle-ID mangler.");
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
  if (!["2", "14"].includes(env.GA_RETENTION_MONTHS || ""))
    errors.push("Bekreftet GA4-lagringstid må være 2 eller 14 måneder.");
  if (env.LAUNCH_VERIFIED !== "true")
    errors.push(
      "Lanseringskontroll i faktisk drift er ikke bekreftet (LAUNCH_VERIFIED).",
    );
  return errors;
}
