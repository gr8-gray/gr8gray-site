/**
 * site.ts — single source for strings that appear in 2+ components.
 * Edit here, not at the call sites. Presentation-only copy that occurs once
 * stays inline in its component.
 */

/** Bare domain. Upper-cased where the doc-strip/footer chrome renders it.
 * (Comment wording note: Tailwind v4 scans every src file for class
 * candidates — avoid bare utility names like the u-word for "capitalized"
 * in comments here or the CSS bundle grows and its hash churns.) */
export const SITE_DOMAIN = "gr8gray.dev";

/** Anchor contract for the single-page layout. Each id is both a
 * `<section id>` and a Nav href target; e2e/home.spec.ts walks every nav
 * anchor, so a rename here without updating BOTH ends fails the suite. */
export const SECTION_IDS = {
  hero: "hero",
  work: "work",
  pantheon: "pantheon",
  how: "how",
  contact: "contact",
} as const;

/** Business location — shown in the nav doc-strip and the footer. */
export const LOCATION = "CHALMETTE, LA";

/** Design revision tag — shown in the nav doc-strip and the footer endmark. */
export const REVISION = "LONGSCROLL-PANTHEON-V1";
