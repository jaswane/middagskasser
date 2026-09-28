import { NextResponse } from "next/server";
import { getProvider } from "@/lib/data";
import { redirectTarget } from "@/lib/commercial";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const p = getProvider(provider);
  const headers = {
    "X-Robots-Tag": "noindex, nofollow",
    "Cache-Control": "no-store",
  };
  if (!p) return new Response("Ukjent leverandør", { status: 404, headers });
  const placement = new URL(request.url).searchParams.get("placement");
  return new NextResponse(null, {
    status: 302,
    headers: { ...headers, Location: redirectTarget(p.id, placement) },
  });
}
