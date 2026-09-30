import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const routes = [
  "/",
  "/hellofresh",
  "/godtlevert",
  "/hellofresh-vs-godtlevert",
  "/slik-sammenligner-vi",
  "/om",
  "/kontakt",
  "/personvern",
  "/annonselenker",
  "/finn-matkasse",
  "/designoversikt",
];
const internal = new Set();
const announcedIcons = new Set();
for (const path of routes) {
  const r = await fetch(base + path);
  assert.equal(r.status, 200, path);
  const html = await r.text();
  assert.match(html, /<h1[ >]/, path);
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `One H1: ${path}`);
  assert.match(html, /<title>[^<]+<\/title>/, path);
  assert.match(html, /name="description" content="[^"]+"/, path);
  assert.ok(
    html.includes(
      `rel="canonical" href="https://middagskasser.no${path === "/" ? "" : path}"`,
    ) ||
      html.includes(`rel="canonical" href="https://middagskasser.no${path}"`),
    `Canonical: ${path}`,
  );
  assert.match(
    html,
    /property="og:image" content="https:\/\/middagskasser.no\/og.png\?v=[0-9a-f]{8}"/,
    path,
  );
  // Icons come only from file-based metadata, with a content hash in the URL.
  const icons = [
    ...html.matchAll(
      /<link rel="(?:icon|apple-touch-icon|shortcut icon)"[^>]*href="([^"]+)"/g,
    ),
  ].map((m) => m[1].replaceAll("&amp;", "&"));
  assert.ok(
    icons.some((href) => /^\/icon\.svg\?/.test(href)),
    `SVG icon: ${path}`,
  );
  assert.ok(
    icons.some((href) => /^\/favicon\.ico/.test(href)),
    `ICO: ${path}`,
  );
  assert.ok(
    icons.some((href) => /^\/apple-icon\.png\?/.test(href)),
    `Apple icon: ${path}`,
  );
  for (const old of [
    "/favicon.svg",
    "/favicon-32.png",
    "/apple-touch-icon.png",
  ])
    assert.ok(
      !icons.includes(old),
      `Old icon URL advertised: ${old} on ${path}`,
    );
  for (const href of icons) announcedIcons.add(href);
  for (const match of html.matchAll(
    /<script type="application\/ld\+json">([^<]+)<\/script>/g,
  ))
    JSON.parse(match[1]);
  if (path !== "/designoversikt") {
    for (const match of html.matchAll(/<a[^>]+href="([^"#]+)"/g)) {
      const href = match[1].replaceAll("&amp;", "&");
      if (href.startsWith("/") && !href.startsWith("/go/"))
        internal.add(href.split("#")[0]);
    }
  }
  assert.match(html, /name="robots" content="noindex/, path);
  assert.match(html, /<link rel="canonical"/, path);
  if (path !== "/kontakt")
    assert.ok(
      !html.includes("kontakt@swanecreative.no"),
      `Contact rule: ${path}`,
    );
  assert.ok(
    !html.includes("googletagmanager.com/gtag/js?id="),
    `No active GA: ${path}`,
  );
  console.log("200 + metadata + contact rule:", path);
}
for (const href of internal)
  assert.equal((await fetch(base + href)).status, 200, `Internal link ${href}`);
for (const href of announcedIcons) {
  const r = await fetch(base + href);
  assert.equal(r.status, 200, href);
  assert.match(r.headers.get("content-type"), /^image\//, href);
}
for (const asset of [
  "favicon.ico",
  "favicon.svg",
  "favicon-32.png",
  "apple-touch-icon.png",
  "og.png",
  "brands/hellofresh.ico",
  "brands/hellofresh-logo.png",
  "brands/godtlevert-icon.svg",
  "brands/godtlevert-logo.svg",
])
  assert.equal((await fetch(base + "/" + asset)).status, 200, asset);
assert.equal((await fetch(base + "/finnes-ikke")).status, 404);
// Inherited object property names must not resolve to a [slug] page.
for (const slug of [
  "constructor",
  "__proto__",
  "toString",
  "hasOwnProperty",
  "valueOf",
  "isPrototypeOf",
])
  assert.equal((await fetch(base + "/" + slug)).status, 404, `/${slug}`);
for (const id of ["hellofresh", "godtlevert"]) {
  const r = await fetch(
    base + `/go/${id}?placement=comparison&url=https://evil.example`,
    { redirect: "manual" },
  );
  assert.equal(r.status, 302);
  assert.equal(
    r.headers.get("location"),
    `https://www.ebutikker.no/nettbutikkside/${id}/`,
  );
  assert.match(r.headers.get("x-robots-tag"), /noindex/);
  assert.equal(r.headers.get("cache-control"), "no-store");
  // Provider CTAs go through /go/ as plain links; without direct affiliate
  // links they are neither sponsored nor labelled as ads.
  const page = await (await fetch(base + `/${id}`)).text();
  assert.match(page, new RegExp(`href="/go/${id}\\?placement=`));
  assert.ok(!page.includes('rel="sponsored'), `No sponsored rel: /${id}`);
}
assert.equal(
  (await fetch(base + "/go/evil", { redirect: "manual" })).status,
  404,
);
const sitemap = await (await fetch(base + "/sitemap.xml")).text();
assert.ok(!sitemap.includes("/go/"));
assert.ok(!sitemap.includes("/designoversikt"));
assert.ok(!sitemap.includes("/finn-matkasse"));
assert.match(await (await fetch(base + "/robots.txt")).text(), /Disallow: \//);
console.log("404, safe redirects, noindex, sitemap and robots: passed");
console.log(
  "All internal links, one H1, canonical, metadata, JSON-LD and brand assets: passed",
);
