export type PortfolioEntry = {
  name: string;
  url: string;
  blurb: string;
  stack: string;
  image?: string;        // path under /public, e.g. "/work/bayou.png"
  imageAlt?: string;
  lead?: boolean;        // if true, render as large lead card
};

export const portfolio: PortfolioEntry[] = [
  {
    name: "Bayou Charity Platform",
    url: "https://bayoucharity.org",
    blurb:
      "Nonprofit donation + community platform built in partnership with the founder. Replaces three separate tools the org was paying for — donations, member directory, event signup — in one stack the team actually owns.",
    stack: "Next.js 16 web + Expo mobile, Supabase backend. Cloudflare Pages.",
    image: "/work/bayou.png",
    imageAlt: "Bayou Charity homepage — coastal hero with 'Bayou Family Fishing' title over open water.",
    lead: true,
  },
  {
    name: "Operation Healing Waters",
    url: "https://operationhealingwaters.org",
    blurb:
      "Marketing site for a veteran-led nonprofit running free guided fishing outings for vets and underprivileged youth. Twelve-component single-page design with a wave-divider visual system, wired to Zeffy for donations and EmailJS for contact.",
    stack: "Next.js 16 static export, Tailwind, Framer Motion. Cloudflare Pages.",
    image: "/work/ohw.png",
    imageAlt: "Operation Healing Waters homepage — 'Healing Happens on the Water' over a fishing scene.",
  },
  {
    name: "Immortal Vibes",
    url: "https://www.theimmortalvibes.com",
    blurb:
      "Headless e-commerce stack the owner controls end-to-end. Stripe Payment Element checkout (no redirect), Cloudflare Worker as edge shield, Go API on Fly.io behind a proxy-secret header — direct hits to the API return 403.",
    stack: "SvelteKit + Cloudflare Pages, Go (chi) on Fly.io, Postgres + R2 + KV, Stripe.",
    image: "/work/iv-home.png",
    imageAlt: "Immortal Vibes homepage — 'Rise Beyond the Mortal Plane' title over a galaxy/nebula hero.",
  },
  {
    name: "Green Collar Landscaping",
    url: "https://gcl-wa.com",
    blurb:
      "Lead-gen site for a Washington-state landscaping business. Built for an owner who needed the phone to ring, not a CMS to maintain. Photo-forward, mobile-first, contact form wired to email.",
    stack: "React + Vite + Tailwind. Cloudflare Pages.",
    image: "/work/gcl.png",
    imageAlt: "Green Collar Landscaping homepage — 'Hardscaping Solutions Engineered for the Pacific Northwest' hero.",
  },
  {
    name: "Metron Matrix Solutions",
    url: "https://metronmatrix.com",
    blurb:
      "Capability statement site for an SDVOSB-certified GovCon firm. Astro static for sub-second load, built to look credible at first glance — what contracting officers actually evaluate.",
    stack: "Astro, Cloudflare Pages.",
    image: "/work/metron.png",
    imageAlt: "Metron Matrix homepage — dark blue 'Mission-Critical Solutions for Defense and Government' hero.",
  },
];
