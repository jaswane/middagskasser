"use client";
import { ArrowUpRight } from "lucide-react";
import { track } from "./analytics";
import type { EditorialProviderId, ProviderId } from "@/lib/data";
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
// Plain link straight to a provider we have no commercial relationship with:
// no /go/ redirect, no sponsored/nofollow and no ad label.
export function DirectOutbound({
  id,
  url,
}: {
  id: EditorialProviderId;
  url: string;
}) {
  return (
    <div className="outbound">
      <a
        href={url}
        className="button button-outline"
        onClick={() =>
          track("provider_outbound", {
            provider: id,
            placement: "provider_bottom",
            page: location.pathname,
            offer_type: "none",
          })
        }
      >
        Gå til {new URL(url).hostname.replace(/^www\./, "")}
        <ArrowUpRight size={16} />
      </a>
    </div>
  );
}
