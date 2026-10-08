import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
// The same test covers the preview (noindex) and the live, indexable site.
const robots = await (await fetch(base + "/robots.txt")).text();
const live = /Allow: \//.test(robots);
const noindexRoutes = ["/finn-matkasse", "/designoversikt"];
const indexable = [
  "/",
  "/hellofresh",
  "/godtlevert",
  "/hellofresh-vs-godtlevert",
  "/slik-sammenligner-vi",
  "/om",
  "/kontakt",
  "/personvern",
  "/annonselenker",
  "/kokkeloren",
  "/matkasser",
];
const routes = [...indexable, ...noindexRoutes];
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
  assert.match(
    html,
    live && !noindexRoutes.includes(path)
      ? /name="robots" content="index, follow"/
      : /name="robots" content="noindex/,
    path,
  );
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
// Editorial providers: a plain, direct link and no /go/ redirect or ad label.
assert.equal(
  (await fetch(base + "/go/kokkeloren", { redirect: "manual" })).status,
  404,
);
const kokkeloren = await (await fetch(base + "/kokkeloren")).text();
const direct = kokkeloren.match(
  /<a[^>]+href="https:\/\/kokkeloren\.no\/"[^>]*>/,
);
assert.ok(direct, "Direct link to kokkeloren.no");
assert.ok(!/rel="[^"]*(sponsored|nofollow)/.test(direct[0]), direct[0]);
assert.ok(!kokkeloren.includes("/go/kokkeloren"));
// No ad label by the button and no affiliate disclosure (the footer link
// "Annonselenker" is fine).
assert.ok(!kokkeloren.includes("Annonselenke ·"));
assert.ok(!kokkeloren.includes("Annonse:"));
assert.match(await (await fetch(base + "/")).text(), /href="\/kokkeloren"/);
const sitemap = await (await fetch(base + "/sitemap.xml")).text();
assert.ok(!sitemap.includes("/go/"));
assert.ok(!sitemap.includes("/designoversikt"));
assert.ok(!sitemap.includes("/finn-matkasse"));
if (live) {
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.deepEqual(
    locs.sort(),
    indexable.map((p) => "https://middagskasser.no" + p).sort(),
  );
  assert.match(robots, /Sitemap: https:\/\/middagskasser\.no\/sitemap\.xml/);
} else {
  assert.ok(!sitemap.includes("<loc>"));
  assert.match(robots, /Disallow: \//);
}
console.log(
  `404, safe redirects, robots and sitemap (${live ? "indexable" : "noindex"} mode): passed`,
);
console.log(
  "All internal links, one H1, canonical, metadata, JSON-LD and brand assets: passed",
);
