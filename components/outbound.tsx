"use client";
import { ArrowUpRight } from "lucide-react";
import { track } from "./analytics";
import type { ProviderId } from "@/lib/data";
export function Outbound({
  id,
  name,
  placement = "comparison",
  affiliate = false,
}: {
  id: ProviderId;
  name: string;
  placement?: "comparison" | "selector_result" | "provider_bottom";
  affiliate?: boolean;
}) {
  return (
    <div className="outbound">
      {affiliate && (
        <small>Annonselenke · Vi kan få provisjon ved bestilling.</small>
      )}
      <a
        href={`/go/${id}?placement=${placement}`}
        rel={affiliate ? "sponsored nofollow" : "nofollow"}
        className="button button-outline"
        onClick={() =>
          track(affiliate ? "affiliate_click" : "provider_outbound", {
            provider: id,
            placement,
            page: location.pathname,
            offer_type: "none",
          })
        }
      >
        {/* Without a direct affiliate link, /go/ lands on eButikker.no, not the provider. */}
        {affiliate ? `Se pris hos ${name}` : `Til ${name} via eButikker.no`}
        <ArrowUpRight size={16} />
      </a>
    </div>
  );
}
