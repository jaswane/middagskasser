import type { NextConfig } from "next";
import { launchErrors } from "./lib/launch";
if (process.env.NEXT_PUBLIC_INDEXABLE === "true") {
  const errors = launchErrors(process.env);
  if (errors.length) throw new Error("NO-GO: " + errors.join(" "));
}
const config: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default config;
