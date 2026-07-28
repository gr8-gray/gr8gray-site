import { test, expect } from "@playwright/test";

// Customer path, step 1: a visitor lands on the page and every section of the
// pitch is actually there. If any of these fail, the funnel is broken before
// the form is even reached.

test.describe("home page renders", () => {
  test.beforeEach(async ({ page }) => {
    // domcontentloaded, not load: assertions auto-wait anyway, and the full
    // load event stalls on heavyweight background art over slow links.
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  test("loads with the expected title and headline", async ({ page }) => {
    await expect(page).toHaveTitle(/gr8gray\.dev/i);
    await expect(
      page.getByRole("heading", { level: 1, name: /ship your site in two weeks/i }),
    ).toBeVisible();
  });

  test("all five pitch sections are present", async ({ page }) => {
    // Section ids double as the nav anchor contract — if one disappears,
    // nav links silently dead-end, so assert ids rather than headings alone.
    for (const id of ["hero", "work", "pantheon", "how", "contact"]) {
      await expect(page.locator(`section#${id}`)).toBeAttached();
    }
    await expect(page.locator("#work h2")).toContainText(/recent builds/i);
    await expect(page.locator("#how h2")).toContainText(/process/i);
  });

  test("nav links target existing anchors", async ({ page }) => {
    const hrefs = await page
      .locator('nav a[href^="#"], header a[href^="#"], a[href^="#"]')
      .evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    // Every in-page link must resolve to a real element — a renamed section id
    // is the most likely regression on a single-page layout.
    for (const href of new Set(hrefs)) {
      if (!href || href === "#") continue;
      await expect(page.locator(href).first(), `anchor target ${href}`).toBeAttached();
    }
  });

  test("portfolio shows at least one work card with a link", async ({ page }) => {
    const workLinks = page.locator('#work a[href^="http"]');
    expect(await workLinks.count()).toBeGreaterThan(0);
  });
});
