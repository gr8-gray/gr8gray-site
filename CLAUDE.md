# gr8gray-site — Codebase Guide

Freelance lead-funnel site for Eric Gray, live at **https://gr8gray.dev**.
Single-page Astro static site. Its one job: convert a visitor into a teaser-form
submission. The form is handled by a **separate repo** — `gr8-gray/gr8gray-forms`
(Cloudflare Worker). Read "The site↔forms contract" below before touching the form.

## Tour — what lives where

```
astro.config.mjs          Astro config: site=https://gr8gray.dev, Tailwind v4 via Vite plugin
src/pages/index.astro     The only page. Assembles components in order:
                          Hero → Work → ProductEngineering → About → Contact (+ Nav in components, Footer)
src/components/
  Nav.astro               Fixed nav, anchor links: #hero #work #pantheon #how #contact
  Hero.astro              <section id="hero">, h1 "Ship your site in two weeks."
  Work.astro              <section id="work"> "Recent builds." — renders src/data/portfolio.ts
  ProductEngineering.astro <section id="pantheon"> "Personal firmware." — the four-figures block
  About.astro             <section id="how"> "Process — five steps, no surprises."
  Contact.astro           <section id="contact"> — the teaser form + submit JS. THE money component.
  PantheonBackground.astro Decorative scroll-reactive background (images in public/pantheon/)
  Footer.astro            Footer
src/data/
  portfolio.ts            Portfolio entries (typed). Add/edit work items HERE, not in Work.astro.
  about.ts                Bio data consumed by About.astro
src/styles/global.css     All styling. Fonts: Cormorant Garamond / IBM Plex Mono / IBM Plex Sans.
public/                   Static assets: work screenshots, pantheon art, favicon
.env.example              The two build-time env vars (see below)
e2e/                      Playwright specs against the LIVE site (see E2E policy)
.github/workflows/
  deploy.yml              Push to main → build → Cloudflare Pages deploy
  e2e.yml                 Weekly + manual E2E run against production
```

## Cross-cutting rules

- **Content is data-driven.** Portfolio and bio text live in `src/data/*.ts`; components
  render them. Edit data files for content changes, components only for layout.
- Single page, anchor navigation. New sections need: a `<section id>`, a Nav link,
  and (if customer-visible) an E2E assertion in `e2e/`.
- No client framework — plain Astro + one inline `<script>` in Contact.astro.
  Keep it that way; the page's pitch is performance.

## The site↔forms contract (cross-repo trap)

`Contact.astro` and `gr8gray-forms/src/index.ts` are two halves of one feature
in two repos. **Any change to one side must be mirrored in the other.**

- Endpoint: `POST {PUBLIC_FORMS_ORIGIN}/teaser` (default `https://forms.gr8gray.dev`),
  JSON body, submitted via `fetch` from the inline script in Contact.astro.
- Payload fields — names, max lengths, and enum values are validated server-side
  and must match exactly:

  | field | constraint |
  |---|---|
  | `name_email` | string, ≤200 |
  | `one_liner` | string, ≤500 |
  | `success_metric` | string, ≤500 |
  | `deadline` | `hard` \| `soft` \| `flexible` |
  | `budget` | `lt2k` \| `2to5k` \| `5to10k` \| `10to25k` \| `gt25k` \| `unsure` |
  | `examples` | string, ≤1000 |
  | `cf-turnstile-response` | Turnstile token (widget injects it into FormData) |

- Responses the inline script handles: `200 {ok,id}` success; `202` submission
  saved but email delivery failed (still shown as success); `400` validation;
  `403` Turnstile rejection; on non-OK the UI shows "EMAIL ERIC@GR8GRAY.DEV".
- **CORS:** the worker allowlists `https://gr8gray.dev`, `https://www.gr8gray.dev`,
  `http://localhost:4321`. A new site origin (preview URL, apex change) will
  silently break the form until added to `ORIGIN_ALLOWLIST` in the worker.
- **Build-time env baking:** `PUBLIC_FORMS_ORIGIN` and `PUBLIC_TURNSTILE_SITE_KEY`
  are inlined at `astro build` time (from GitHub secrets in CI). Rotating the
  Turnstile key or moving the worker requires a site **redeploy**, not just a
  secret update.

## Deploy path

Push to `main` → `.github/workflows/deploy.yml` → `npm ci` → `astro build`
(with the two PUBLIC_ env secrets) → `wrangler pages deploy dist
--project-name=gr8gray-site` → Cloudflare Pages serves gr8gray.dev.
No staging environment; main is production.

## E2E policy (STOP 19)

- Specs live in `e2e/`, run with Playwright (chromium) against the **live site**
  (`E2E_BASE_URL` overrides, defaults to https://gr8gray.dev).
- Covered: home renders, all five sections present, nav anchors, form renders
  with the full field contract, client-side validation blocks empty submit.
- **Tests must never submit a real lead** — every accepted POST emails Eric.
  The specs abort any request to the forms origin as a guardrail; keep that.
- CI: `.github/workflows/e2e.yml` — `workflow_dispatch` + Mondays 14:00 UTC.
- Run locally: `npx playwright install chromium && npx playwright test`.

## Known traps

- `hephaestus-manual.png.bak` in public/pantheon/ is a kept manual crop — don't "clean it up".
- Google Fonts are loaded from CDN; the page depends on network fonts (accepted trade-off).
- Turnstile dev key `1x00000000000000000000AA` always passes client-side but the
  live worker still rejects its tokens — local form testing needs the local worker
  (`wrangler dev` in gr8gray-forms, `PUBLIC_FORMS_ORIGIN=http://localhost:8787`).
