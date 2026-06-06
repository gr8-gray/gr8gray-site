# gr8gray.dev — Deploy Setup Runbook

Single-source-of-truth for the human steps needed to get the site + Worker
shipping from GitHub Actions. Order matters. Total time ~20 min.

> **PRE-STEP — push the CI workflows** (~1 min)
>
> The `gh` CLI is currently logged in without the `workflow` OAuth scope,
> so the initial push could not include `.github/workflows/deploy.yml` in
> either repo. The CI commits exist locally on `main` (ahead of `origin/main`
> by 1 commit in each repo). To finish them:
>
> ```bash
> gh auth refresh -s workflow -h github.com
> # follow the one-time code prompt in the browser
>
> cd C:\Users\EricG\Documents\gr8gray-site  && git push
> cd C:\Users\EricG\Documents\gr8gray-forms && git push
> ```
>
> After that, the Actions tab on both repos will show the first (failing) run.
> Continue with step A below to provision the secrets that make them pass.

Repos:
- Site: https://github.com/gr8-gray/gr8gray-site
- Worker: https://github.com/gr8-gray/gr8gray-forms

---

## A. Cloudflare API token  (~2 min)

1. Cloudflare Dashboard -> My Profile -> API Tokens -> **Create Token** -> **Custom token**.
2. Permissions:
   - Account · Cloudflare Pages · **Edit**
   - Account · Workers Scripts · **Edit**
   - Account · Workers KV Storage · **Edit**
   - Zone · DNS · **Edit** (scoped to the `gr8gray.dev` zone)
3. Save the token value somewhere temporary — you'll paste it into GitHub secrets in step E.
4. Grab the **Account ID** from the Dashboard right sidebar.

> The token never goes in this repo. Only in GitHub Actions secrets.

---

## B. Brevo account + domain verification  (~5 min)

> If you previously used Resend on bayoucharity.org, the free tier capped you at one domain — Brevo replaces it here without the multi-domain upcharge.

1. Sign up at https://brevo.com (free tier: 300 emails/day, unlimited domains).
2. Senders & IP -> Domains -> **Add a domain** -> enter `gr8gray.dev`.
3. Brevo returns DNS records: typically 1 DKIM (TXT named `mail._domainkey`), 1 Brevo verification (TXT at root or a subdomain), and a DMARC record suggestion. Paste each into Cloudflare DNS for the `gr8gray.dev` zone.
4. Click **Verify** in Brevo. Usually verifies within 5 minutes.
5. SMTP & API -> API Keys -> **Generate a new API key** (give it a clear name like `gr8gray-forms worker`). Save it — this is `BREVO_API_KEY`.

---

## C. Turnstile site registration  (~2 min)

1. Cloudflare Dashboard -> Turnstile -> **Add site**.
2. Hostnames: `gr8gray.dev`, `www.gr8gray.dev`, `localhost`.
3. Widget Mode: **Managed**.
4. Save both:
   - **Site key** (public) -> `PUBLIC_TURNSTILE_SITE_KEY`
   - **Secret key** -> `TURNSTILE_SECRET_KEY`

---

## D. KV namespace + Worker secrets  (~3 min, terminal)

```bash
cd C:\Users\EricG\Documents\gr8gray-forms

npx wrangler kv namespace create FORM_LOG
# Copy the returned `id = "..."` into wrangler.toml, replacing REPLACE_WITH_KV_ID.

npx wrangler secret put BREVO_API_KEY         # paste xkeysib-... from step B
npx wrangler secret put TURNSTILE_SECRET_KEY  # paste from step C
npx wrangler secret put NOTIFY_TO             # your destination email (e.g. ericgray928@live.com)
npx wrangler secret put NOTIFY_FROM           # noreply@gr8gray.dev  (must be on the verified Brevo domain)
```

> The local `wrangler` is logged in with read-only OAuth scopes for now.
> `secret put` and `kv namespace create` both need write — if you hit a 403,
> run `npx wrangler logout` then `npx wrangler login` and re-authorize the
> write scopes in the browser. After secrets are set, the CI uses the API
> token from step A and your local scopes don't matter anymore.

---

## E. GitHub repo secrets  (~3 min)

Set on **both** `gr8-gray/gr8gray-site` and `gr8-gray/gr8gray-forms`:

| Name                     | Value source                       |
| ------------------------ | ---------------------------------- |
| `CLOUDFLARE_API_TOKEN`   | step A (the token string)          |
| `CLOUDFLARE_ACCOUNT_ID`  | step A (the account ID)            |

Set on `gr8-gray/gr8gray-site` only:

| Name                          | Value                              |
| ----------------------------- | ---------------------------------- |
| `PUBLIC_TURNSTILE_SITE_KEY`   | step C (site key)                  |
| `PUBLIC_FORMS_ORIGIN`         | `https://forms.gr8gray.dev`        |

CLI form (paste value at the prompt):

```bash
gh secret set CLOUDFLARE_API_TOKEN  --repo gr8-gray/gr8gray-site
gh secret set CLOUDFLARE_ACCOUNT_ID --repo gr8-gray/gr8gray-site
gh secret set PUBLIC_TURNSTILE_SITE_KEY --repo gr8-gray/gr8gray-site
gh secret set PUBLIC_FORMS_ORIGIN --repo gr8-gray/gr8gray-site --body "https://forms.gr8gray.dev"

gh secret set CLOUDFLARE_API_TOKEN  --repo gr8-gray/gr8gray-forms
gh secret set CLOUDFLARE_ACCOUNT_ID --repo gr8-gray/gr8gray-forms
```

---

## F. First CI run + custom domains  (~5 min)

1. Trigger the workflows (either push any small commit, or run manually):
   ```bash
   gh workflow run "Deploy site to Cloudflare Pages" --repo gr8-gray/gr8gray-site
   gh workflow run "Deploy Worker"                   --repo gr8-gray/gr8gray-forms
   ```
2. First site deploy publishes to `gr8gray-site.pages.dev`.
   Cloudflare Dashboard -> Pages -> `gr8gray-site` -> **Custom domains** -> add
   `gr8gray.dev` and `www.gr8gray.dev`. CF creates the CNAMEs automatically.
3. Worker custom domain:
   Cloudflare Dashboard -> Workers & Pages -> `gr8gray-forms` -> Triggers/Domains
   -> add `forms.gr8gray.dev`.

---

## G. Verification

```bash
curl -I https://gr8gray.dev                    # expect HTTP/2 200 + cf-ray header
curl -I https://forms.gr8gray.dev/teaser       # expect 404 (only POST is allowed) + CF headers
```

Then:

1. Open https://gr8gray.dev, fill out the contact form, submit.
2. Check the inbox at `NOTIFY_TO` — email should arrive within seconds.
3. Confirm the audit row landed in KV:
   ```bash
   cd C:\Users\EricG\Documents\gr8gray-forms
   npx wrangler kv key list --binding FORM_LOG --remote
   ```

---

## Notes

- The first workflow runs **before** secrets land will fail — that's expected.
- Don't commit `.env` or any `re_...` / `0x...` values. `.env.example` is safe.
- Token rotation: regenerate in step A, update both repo secrets via `gh secret set`,
  and revoke the old token in the CF dashboard. No code changes needed.
