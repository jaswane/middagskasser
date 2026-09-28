import Link from "next/link";
import type { ProviderId } from "@/lib/data";
export function AffiliateDisclosure({
  flags,
}: {
  flags: Partial<Record<ProviderId, boolean>>;
}) {
  const names = [
    flags.godtlevert && "Godtlevert",
    flags.hellofresh && "HelloFresh",
  ].filter(Boolean);
  if (!names.length) return null;
  return (
    <p className="price-note">
      <span>
        <strong>Annonse:</strong> Vi har annonselenker til {names.join(" og ")}.
        Vi kan få provisjon ved bestilling. Det påvirker ikke sammenligningen.{" "}
        <Link href="/annonselenker">Om annonselenker</Link>.
      </span>
    </p>
  );
}
