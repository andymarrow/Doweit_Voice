# Email integration (SMTP) — setup guide

Email beautifully-formatted call summaries to one or more recipients via your own SMTP server. We use [Nodemailer](https://nodemailer.com) under the hood, which works with **any SMTP-compatible provider**: Gmail, Outlook, Mailgun, Mailtrap, SendGrid, your own server, etc.

You will:

1. Pick or create an SMTP-capable email account
2. Get host, port, username, and password (for Gmail this is an *App password*)
3. Paste them into the workspace Integrations page
4. Configure a per-agent rule and test it

---

## Easiest option: Gmail

If you have a Gmail or Google Workspace account, you can send through Google's SMTP server with no domain or paid plan.

### Step 1 — Enable 2-Step Verification

App passwords require 2FA on the account.

1. Go to https://myaccount.google.com/security
2. Under "How you sign in to Google", enable **2-Step Verification** if it's off

### Step 2 — Create an App password

1. Visit https://myaccount.google.com/apppasswords
2. Pick **Mail** as the app, and **Other (Custom name)** for the device → call it "Doweit Voice"
3. Click **Generate**. Copy the 16-character password (looks like `abcd efgh ijkl mnop` — keep the spaces or remove them, both work)

### Step 3 — Connect in Doweit Voice

In the app: **Call Agents → Integrations → Email (SMTP)** card.

| Field | Value |
|---|---|
| SMTP host | `smtp.gmail.com` |
| Port | `465` |
| Use SSL/TLS | ✅ checked |
| SMTP user | `you@gmail.com` |
| SMTP password | the App password from step 2 |
| From name | (optional) "Doweit Voice" |
| From email | (optional) leave blank to default to `you@gmail.com` |

Click **Connect**. We open an SMTP connection to verify — if it works, the card flips to Connected.

> Gmail rate limit: ~500 messages/day for free Gmail, ~2000/day for Google Workspace. Plenty for most use cases.

---

## Other providers — sample settings

### Outlook / Microsoft 365

| Field | Value |
|---|---|
| Host | `smtp.office365.com` |
| Port | `587` |
| Use SSL/TLS | ❌ unchecked (uses STARTTLS on 587) |
| User | your Microsoft email |
| Password | your account password (or app password if 2FA on) |

### Mailgun

| Field | Value |
|---|---|
| Host | `smtp.mailgun.org` |
| Port | `587` (or `465` with SSL) |
| User | `postmaster@your-domain.mailgun.org` |
| Password | your Mailgun SMTP password |

Mailgun requires a verified domain.

### Mailtrap (for local testing — emails go to a fake inbox)

| Field | Value |
|---|---|
| Host | `sandbox.smtp.mailtrap.io` |
| Port | `2525` |
| Use SSL/TLS | ❌ unchecked |
| User/password | from your Mailtrap inbox |

Best for development — never reaches real recipients.

### Custom server

| Field | Value |
|---|---|
| Host | your server hostname |
| Port | `465` (SSL) or `587` (STARTTLS) |
| Use SSL/TLS | check for 465, uncheck for 587 |
| User/password | as configured on your server |

---

## Per-agent setup

Open any agent → **Integrations** in the sidebar. Click **Send to Email** to add a rule:

- **Rule name:** e.g. *"Manager daily summary"*
- **To:** comma-separated list of recipients (`alice@example.com, bob@example.com`)
- **Cc / Bcc:** optional
- **Email subject:** templated, e.g. `Call summary — {{call.agentName}}`. Variables work in subject lines too.
- **Email body:** the editor accepts Markdown-ish syntax: `**bold**`, `*italic*`, `[link](url)`. The platform wraps your content in a responsive HTML shell with header/footer and the action data table.
- **When to fire:** all calls, only when specific actions present, or when a value matches a condition.

Click **Send a test message** to fire a sample email. Check your inbox.

## Troubleshooting

| Error | Likely cause |
|---|---|
| `Invalid login: 535-5.7.8 Username and Password not accepted` | Gmail rejected the app password. Re-generate it; ensure 2FA is on. |
| `Connection timeout` | Wrong port, or your network blocks outbound SMTP. Try 587 vs 465. |
| `EAUTH` | Wrong user or password. |
| `EENVELOPE` | The From address is invalid for the SMTP server. Set "From email" to a verified address. |
| Recipient never receives the email | Spam folder! Especially likely the first time. After a couple of legit emails Gmail/Outlook will trust your sender. |

## Privacy notes

- The SMTP password is encrypted at rest with your `ENCRYPTION_KEY` before storage. Only the server can decrypt it at send time.
- We do not store the rendered email body permanently — only the subject + recipient list lives in the dispatch log.
