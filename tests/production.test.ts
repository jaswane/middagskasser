import { test } from "node:test";
import assert from "node:assert/strict";
import {
  consentValue,
  newConsent,
  eventParams,
  measuredPath,
  validGaId,
  consentCommands,
  CONSENT_DAYS,
  METHOD_VERSION,
} from "../lib/measurement.ts";
import { redirectTarget, destination } from "../lib/commercial.ts";
import { launchErrors } from "../lib/launch.ts";
import { pageMetadata, indexablePaths } from "../lib/seo.ts";
import { providers } from "../lib/data.ts";
import { matchProviders, type Answers } from "../lib/selector.ts";
const now = Date.parse("2026-09-28T12:00:00Z");
test("consent requires a versioned, unexpired explicit choice", () => {
  for (const raw of [
    null,
    "yes",
    "no",
    "{",
    '{"choice":"yes"}',
    JSON.stringify({ ...newConsent("yes", now), version: 2 }),
  ])
    assert.equal(consentValue(raw, now), null);
  for (const choice of ["yes", "no"] as const) {
    const raw = JSON.stringify(newConsent(choice, now));
    assert.equal(consentValue(raw, now)?.choice, choice);
    assert.equal(consentValue(raw, now + CONSENT_DAYS * 86400000), null);
    assert.equal(consentValue(raw, now - 1), null);
  }
});
test("all required events accept their documented coarse contract", () => {
  const events = {
    selector_start: { page: "/finn-matkasse", placement: "selector_page" },
    selector_answer: { step: "people", answer_id: 4 },
    selector_complete: {
      result_type: "shared_or_uncertain",
      method_version: METHOD_VERSION,
    },
    comparison_view: { page: "/", placement: "comparison" },
    provider_view: { provider: "hellofresh", page: "/hellofresh" },
    affiliate_click: {
      provider: "godtlevert",
      page: "/",
      placement: "comparison",
      offer_type: "none",
    },
    sibling_site_click: {
      page: "/",
      placement: "sibling_section",
      direction: "middagskasser_to_middagen",
    },
  };
  for (const [event, params] of Object.entries(events))
    assert.ok(eventParams(event, params), event);
});
test("analytics strips extra fields and rejects raw answers, unknown routes and query strings", () => {
  assert.deepEqual(
    eventParams("selector_answer", {
      step: "people",
      answer_id: 4,
      email: "private@example.invalid",
    }),
    { step: "people", answer_id: "4" },
  );
  for (const answer of ["private@example.invalid", "0150", "price"])
    assert.equal(
      eventParams("selector_answer", { step: "people", answer_id: answer }),
      null,
    );
  assert.equal(
    eventParams("page_view", { page_path: "/?email=private" }),
    null,
  );
  assert.equal(eventParams("custom", {}), null);
  assert.equal(eventParams("constructor", {}), null);
  assert.equal(measuredPath("/unknown/private"), "/404");
});
test("Google configuration leaves advertising denied and disables automatic page views", () => {
  assert.equal(validGaId(undefined), false);
  assert.equal(validGaId("G-QATEST1234"), true);
  const commands = consentCommands("G-QATEST1234", "https://middagskasser.no/");
  assert.deepEqual(commands[0], [
    "consent",
    "default",
    {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    },
  ]);
  assert.deepEqual(commands[1], [
    "consent",
    "update",
    { analytics_storage: "granted" },
  ]);
  assert.equal(
    (commands[3][2] as Record<string, unknown>).send_page_view,
    false,
  );
  assert.equal((commands[3][2] as Record<string, unknown>).page_referrer, "");
});
test("affiliate redirects support both partners and every placement without untrusted tracking data", () => {
  for (const id of ["hellofresh", "godtlevert"] as const) {
    const env = {
      [`${id.toUpperCase()}_AFFILIATE_URL`]:
        "https://track.adtraction.com/t/t?a=123&as=456&t=2&url=https%3A%2F%2Fwww.example.invalid%2F&epi=old",
    };
    for (const placement of [
      "comparison",
      "selector_result",
      "provider_bottom",
      null,
      "private@example.invalid",
    ]) {
      const url = new URL(redirectTarget(id, placement, env));
      assert.equal(
        url.searchParams.get("epi"),
        `${id}_${!placement || placement.includes("@") ? "direct" : placement}`,
      );
      assert.equal([...url.searchParams.keys()].at(-1), "url");
      assert.equal(url.searchParams.get("a"), "123");
    }
  }
  const short = new URL(
    redirectTarget("hellofresh", "comparison", {
      HELLOFRESH_AFFILIATE_URL: "https://adtr.co/approved",
    }),
  );
  assert.equal(short.searchParams.get("epi"), "hellofresh_comparison");
});
test("missing or unsafe affiliate configuration falls back to the plain eButikker.no page", () => {
  for (const value of [
    "",
    "javascript:alert(1)",
    "http://adtr.co/x",
    "https://track.adtraction.com.evil.invalid/",
    "https://user:password@adtr.co/x",
  ]) {
    assert.deepEqual(
      destination("hellofresh", { HELLOFRESH_AFFILIATE_URL: value }),
      {
        affiliate: false,
        url: "https://www.ebutikker.no/nettbutikkside/hellofresh/",
      },
    );
  }
});
test("production launch cannot silently use absent legal or commercial configuration", () => {
  const empty = launchErrors({});
  assert.ok(empty.length >= 8);
  const configured = {
    NEXT_PUBLIC_SITE_URL: "https://middagskasser.no",
    NEXT_PUBLIC_GA_ID: "G-QATEST1234",
    HELLOFRESH_AFFILIATE_URL: "https://adtr.co/test-h",
    GODTLEVERT_AFFILIATE_URL: "https://adtr.co/test-g",
    PRIVACY_CONTROLLER: "QA fixture only",
    PRIVACY_OPERATIONS: "QA fixture only",
    PRIVACY_CONTACT_RETENTION: "QA fixture only",
    GA_RETENTION_MONTHS: "2",
    LAUNCH_VERIFIED: "true",
  };
  assert.deepEqual(launchErrors(configured), []);
  assert.ok(launchErrors({ ...configured, LAUNCH_VERIFIED: "false" }).length);
});
test("indexable route list and social metadata stay within the approved scope", () => {
  assert.equal(indexablePaths.length, 9);
  for (const path of [
    "/finn-matkasse",
    "/designoversikt",
    "/go/hellofresh",
    "/404",
  ])
    assert.ok(!indexablePaths.includes(path));
  const metadata = pageMetadata("/hellofresh", "HelloFresh", "Beskrivelse");
  assert.equal(metadata.alternates?.canonical, "/hellofresh");
  assert.equal(metadata.openGraph?.url, "/hellofresh");
});
test("all 72 selector combinations are deterministic and never assign two winners", () => {
  for (const people of [2, 3, 4, 5, 6, 7])
    for (const meals of [2, 3, 4, 5])
      for (const priority of ["price", "selection", "none"] as const) {
        const answers: Answers = { people, meals, priority };
        const matches = matchProviders(providers, answers, new Date(now));
        assert.equal(matches.length, 2);
        assert.ok(matches.filter((m) => m.score > 0).length <= 1);
        assert.ok(
          matches.every((m) => m.compatible !== false || m.score === 0),
        );
        if (priority === "none" || people === 7)
          assert.ok(matches.every((m) => m.score === 0));
      }
});
