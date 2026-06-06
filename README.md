# gr8gray-site

Eric Gray's freelance portfolio. Astro + Tailwind on Cloudflare Pages.

## Run

```
npm install
npm run dev
```

## Deploy

Cloudflare Pages → connect this repo → build command `npm run build` → output `dist/`.

DNS: `gr8gray.dev` is on Cloudflare (account `ericgray928@live.com`).

## Form backend

Teaser form POSTs to `https://forms.gr8gray.dev/teaser` — see sibling repo `gr8gray-forms` (Cloudflare Worker).

Set the form endpoint via `PUBLIC_FORM_ENDPOINT` env var. Defaults to the production URL above.

## Layout

Single page, anchored sections:

- `#hero` — strap-line + dual CTA
- `#work` — 5 portfolio entries
- `#about` — short bio
- `#contact` — 6-field teaser form (Phase A: manual reply within 24 hr)

Copy lives at `freelance/about-draft-v2.md` and `freelance/portfolio-blurbs-v1.md` in the vault.
