# Deployment guide

LokaalKabaal runs on Vercel. This doc covers the external steps that are not
part of the source code: connecting the production domain, setting the
required environment variables, and verifying the cron schedule.

## 1. Connect `lokaalkabaal.agency` (GoDaddy -> Vercel)

1. Vercel dashboard -> **Settings** -> **Domains** -> **Add** ->
   `lokaalkabaal.agency`.
2. Vercel shows two DNS records to create:
   - `A` record: `@` -> `76.76.21.21`
   - `CNAME` record: `www` -> `cname.vercel-dns.com`
3. In GoDaddy **Products** -> **Domain** -> **Manage DNS**:
   - Replace the default parked `A` record at `@` with Vercel's IP.
   - Update the `www` `CNAME` to `cname.vercel-dns.com`.
   - Keep TTL at the registrar default (1 hour).
4. Back in Vercel, click **Refresh** on the domain card. Once DNS propagates
   (usually <10 min, up to 24 h), Vercel provisions a Let's Encrypt certificate
   and the domain goes green.
5. Set `lokaalkabaal.agency` as the **Primary** domain so `www` redirects to
   apex.

## 2. Production environment variables

Set these in Vercel **Settings** -> **Environment Variables** for the
`Production` target (and optionally `Preview` for staging tests):

| Var                      | Example / source                                      | Required |
| ------------------------ | ----------------------------------------------------- | -------- |
| `NEXT_PUBLIC_BASE_URL`   | `https://lokaalkabaal.agency`                         | yes      |
| `SESSION_SECRET`         | 32+ random bytes (`openssl rand -hex 32`)             | yes      |
| `DATABASE_URL`           | Neon connection string                                | yes      |
| `STRIPE_SECRET_KEY`      | Stripe Dashboard -> Developers -> API keys            | yes      |
| `STRIPE_WEBHOOK_SECRET`  | Stripe Dashboard -> Developers -> Webhooks            | yes      |
| `RESEND_API_KEY`         | Resend dashboard                                      | yes      |
| `ANTHROPIC_API_KEY`      | console.anthropic.com                                 | optional |
| `PRINTONE_API_KEY`       | PrintOne dashboard                                    | yes      |
| `PRINTONE_WEBHOOK_SECRET`| PrintOne webhook config                               | yes      |
| `BLOB_READ_WRITE_TOKEN`  | Vercel Blob integration                               | yes      |
| `CRON_SECRET`            | 32+ random bytes                                      | yes      |
| `REDEEM_API_KEY`         | 32+ random bytes (webshop -> conversion endpoint)     | yes      |

Without `NEXT_PUBLIC_BASE_URL` set in production `lib/email.ts` logs a
visible warning at module load and falls back to the hardcoded domain, which
breaks preview-deployment emails. Set it explicitly.

## 3. Verify cron jobs

`vercel.json` already declares three cron entries:

- `POST /api/cron/dispatch`  on `0 8 25 * *`  -- monthly batch flyers
- `POST /api/cron/follow-up` on `0 9 * * *`   -- daily follow-up reminders
- `POST /api/cron/monthly-report` on `0 7 1 * *`

After the first deploy, check Vercel **Deployments** -> **Crons** and confirm
the three jobs are listed. They authenticate via the `CRON_SECRET`
`Authorization: Bearer ...` header that Vercel sends automatically.

## 4. Stripe webhook

Register the webhook endpoint:

- URL: `https://lokaalkabaal.agency/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`,
  `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`.

Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

## 5. PrintOne webhook

- URL: `https://lokaalkabaal.agency/api/printone/webhook`
- Shared secret -> `PRINTONE_WEBHOOK_SECRET`.

## 6. Post-deploy smoke test

- Visit `https://lokaalkabaal.agency` -> homepage renders with new pricing.
- Visit `/login` -> sign up, receive welcome email via Resend.
- Create a campaign through the wizard, complete Stripe checkout in test mode.
- Hit `/api/cron/dispatch` with the correct `Bearer` header -> expect a 200
  JSON summary.
