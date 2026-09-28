import assert from "node:assert/strict";
const base = "http://127.0.0.1:3102";
for (const provider of ["hellofresh", "godtlevert"])
  for (const placement of [
    "comparison",
    "selector_result",
    "provider_bottom",
    "not-allowed",
  ]) {
    const r = await fetch(
      `${base}/go/${provider}?placement=${placement}&url=https://evil.invalid`,
      { redirect: "manual" },
    );
    assert.equal(r.status, 302);
    const url = new URL(r.headers.get("location"));
    assert.equal(url.hostname, "adtr.co");
    assert.equal(
      url.searchParams.get("epi"),
      `${provider}_${placement === "not-allowed" ? "direct" : placement}`,
    );
    assert.equal(url.searchParams.get("url"), null);
    assert.match(r.headers.get("x-robots-tag"), /noindex/);
    assert.equal(r.headers.get("cache-control"), "no-store");
  }
for (const route of [
  "/",
  "/hellofresh",
  "/godtlevert",
  "/hellofresh-vs-godtlevert",
]) {
  const html = await (await fetch(base + route)).text();
  assert.match(html, /Annonse:/);
  assert.match(html, /rel="sponsored nofollow"/);
  assert.match(html, /Annonselenke/);
}
console.log(
  "8 affiliate redirects + EPI + noindex/no-store + disclosure/rel on 4 entry routes: passed (QA URLs only)",
);
