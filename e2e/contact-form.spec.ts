import { test, expect } from "@playwright/test";

// Customer path, step 2: the teaser form — the entire point of the site.
// These specs verify the form's contract with gr8gray-forms WITHOUT ever
// submitting: an accepted POST emails Eric a real lead notification.

// Field contract comes from the repo's single source (src/lib/teaserContract.ts),
// which mirrors gr8gray-forms/src/contract.ts. These specs assert the RENDERED
// form matches it — if either side drifts, submissions 400 in production.
import {
  BUDGET_VALUES,
  DEADLINE_VALUES,
  TEASER_FIELD_NAMES,
} from "../src/lib/teaserContract";

const REQUIRED_FIELDS = TEASER_FIELD_NAMES;

test.describe("teaser form", () => {
  test.beforeEach(async ({ page }) => {
    // Hard guardrail: no request may ever reach the forms worker from these
    // tests, even if a spec bug bypasses client-side validation.
    await page.route("**/teaser", (route) => route.abort());
    // domcontentloaded, not load — see home.spec.ts.
    await page.goto("/#contact", { waitUntil: "domcontentloaded" });
  });

  test("renders with the full field contract", async ({ page }) => {
    const form = page.locator("form#teaser-form");
    await expect(form).toBeVisible();

    for (const name of REQUIRED_FIELDS) {
      const field = form.locator(`[name="${name}"]`);
      await expect(field, `field ${name}`).toBeVisible();
      // Every field is required — the worker rejects blanks, so the browser
      // must catch them first.
      await expect(field).toHaveAttribute("required", "");
    }

    // Enum options must match the worker's allowlists exactly.
    const budgetValues = await form
      .locator('select[name="budget"] option')
      .evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value).filter(Boolean));
    expect(budgetValues.sort()).toEqual([...BUDGET_VALUES].sort());
    const deadlineValues = await form
      .locator('select[name="deadline"] option')
      .evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value).filter(Boolean));
    expect(deadlineValues.sort()).toEqual([...DEADLINE_VALUES].sort());

    // Turnstile container must be present — without it the worker 403s
    // every submission and the funnel is dead.
    await expect(form.locator(".cf-turnstile")).toBeAttached();
  });

  test("client-side validation blocks an empty submit", async ({ page }) => {
    const form = page.locator("form#teaser-form");

    // Native constraint validation fires before the JS submit handler,
    // so clicking with empty required fields must produce no network call.
    await form.getByRole("button", { name: /submit/i }).click();

    const validity = await form.evaluate((f) => {
      const el = f as HTMLFormElement;
      const firstInvalid = el.querySelector(":invalid") as HTMLInputElement | null;
      return { valid: el.checkValidity(), firstInvalid: firstInvalid?.name ?? null };
    });
    expect(validity.valid).toBe(false);
    expect(validity.firstInvalid).toBe("name_email");

    // The JS handler never ran: status line stays empty (it would show
    // SENDING…/ERROR if a request had been attempted).
    await expect(page.locator("#form-status")).toHaveText("");
  });

  test("partially filled form still blocks submit", async ({ page }) => {
    const form = page.locator("form#teaser-form");
    await form.locator('[name="name_email"]').fill("Playwright Bot · noreply@example.com");
    await form.locator('[name="one_liner"]').fill("E2E validation probe — not a lead");

    await form.getByRole("button", { name: /submit/i }).click();

    // Remaining required fields keep the form invalid; nothing was sent.
    expect(await form.evaluate((f) => (f as HTMLFormElement).checkValidity())).toBe(false);
    await expect(page.locator("#form-status")).toHaveText("");
  });
});
