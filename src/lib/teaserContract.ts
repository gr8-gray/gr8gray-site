/**
 * teaserContract.ts — THE SITE HALF OF A TWO-REPO CONTRACT.
 *
 * The other half lives in the `gr8-gray/gr8gray-forms` repo:
 *   gr8gray-forms/src/contract.ts   (single source for the Worker)
 *   gr8gray-forms/src/index.ts      (validate() reads that contract)
 *
 * Field names, max lengths, and enum values here MUST match that file
 * exactly — they change in LOCKSTEP. The Worker validates server-side, so
 * any drift means production submissions start failing with 400s.
 *
 * Consumed by:
 *   src/components/Contact.astro    (form markup: endpoint, maxlengths, enum values)
 *   e2e/contact-form.spec.ts        (asserts the rendered DOM matches this contract)
 *
 * Cross-repo traps that CANNOT be imported and are enforced only by the
 * lockstep rule + e2e suites:
 *   - CORS: the Worker allowlists site origins (gr8gray-forms/src/contract.ts
 *     ORIGIN_ALLOWLIST). A new site origin silently breaks the form.
 *   - Turnstile: PUBLIC_TURNSTILE_SITE_KEY (site, build-time) must pair with
 *     TURNSTILE_SECRET_KEY (worker secret).
 */

/** Default POST target; overridden at build time by PUBLIC_FORMS_ORIGIN. */
export const DEFAULT_FORMS_ORIGIN = "https://forms.gr8gray.dev";

/** The Worker's only route (gr8gray-forms/src/index.ts — everything else 404s). */
export const TEASER_PATH = "/teaser";

/** All fields the Worker requires. Order matches the rendered form. */
export const TEASER_FIELD_NAMES = [
  "name_email",
  "one_liner",
  "success_metric",
  "deadline",
  "budget",
  "examples",
] as const;

/** Server-enforced max lengths for the free-text fields (mirrored as
 * `maxlength` attributes so the browser blocks before the Worker has to). */
export const TEASER_FIELD_MAX = {
  name_email: 200,
  one_liner: 500,
  success_metric: 500,
  examples: 1000,
} as const;

/** `deadline` enum — Worker rejects anything else. Order = rendered order. */
export const DEADLINE_VALUES = ["hard", "soft", "flexible"] as const;

/** `budget` enum — Worker rejects anything else. Order = rendered order.
 * Trap: value names are historical ("lt2k") while the on-screen labels say
 * $2.5K — the VALUES are the wire contract, the labels are free copy. */
export const BUDGET_VALUES = [
  "lt2k",
  "2to5k",
  "5to10k",
  "10to25k",
  "gt25k",
  "unsure",
] as const;

/** Hidden field the Turnstile widget injects into FormData; the Worker
 * verifies it before validation, KV, or email. */
export const TURNSTILE_TOKEN_FIELD = "cf-turnstile-response";

export type DeadlineValue = (typeof DEADLINE_VALUES)[number];
export type BudgetValue = (typeof BUDGET_VALUES)[number];
export type TeaserFieldName = (typeof TEASER_FIELD_NAMES)[number];
