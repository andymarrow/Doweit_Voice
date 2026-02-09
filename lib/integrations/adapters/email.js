// lib/integrations/adapters/email.js
//
// Email adapter using Nodemailer. The user provides SMTP credentials; we
// store them under provider='email' as a JSON object:
//   { host, port, secure, user, password, fromName, fromEmail }
//
// Outbound message: HTML shell + plain-text fallback. The user-authored body
// is treated as Markdown-ish (newlines → <br>, blank lines → <p>) for the
// HTML; the plain-text fallback uses the raw rendered string.

import nodemailer from "nodemailer";

export function buildTransport(config) {
    if (!config?.host || !config?.user) {
        throw new Error("Email connection is missing host/user");
    }
    return nodemailer.createTransport({
        host: config.host,
        port: Number(config.port) || 587,
        secure: !!config.secure, // true for port 465, false otherwise
        auth: {
            user: config.user,
            pass: config.password,
        },
    });
}

// Verify SMTP creds by establishing a connection. Used by the connect endpoint.
export async function verifyTransport(config) {
    const transport = buildTransport(config);
    await transport.verify(); // throws on failure
    transport.close();
    return true;
}

// Convert the rendered template body to HTML. Conservative — wraps each
// non-empty line in a <p> and converts inline `**bold**` / `*italic*` /
// `[link](url)` markdown. Anything fancier would be its own template.
function bodyToHtml(text) {
    if (!text) return "";
    const escapeHtml = (s) =>
        String(s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    const inline = (s) =>
        s
            .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
            .replace(/\*([^*]+)\*/g, "<em>$1</em>")
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    return text
        .split(/\n{2,}/)
        .map((para) => `<p style="margin:0 0 12px 0;line-height:1.55;">${inline(escapeHtml(para)).replace(/\n/g, "<br/>")}</p>`)
        .join("");
}

// Wrap body + action table in a responsive HTML shell.
function buildHtmlEmail({ bodyHtml, ctx, agentName }) {
    const actionsRows =
        (ctx?._actionsList || [])
            .slice(0, 20)
            .map(
                (a) => `
            <tr>
              <td style="padding:8px 12px;border-bottom:1px solid #eef0f3;font-size:13px;color:#5b6472;width:38%;">${a.displayName}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eef0f3;font-size:14px;color:#11151c;font-weight:600;">${a.value}</td>
            </tr>`,
            )
            .join("") || "";

    const ctaButton =
        ctx?.call?.transcriptUrl && ctx.call.transcriptUrl !== "—"
            ? `
        <div style="margin-top:24px;">
          <a href="${ctx.call.transcriptUrl}"
             style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:600;
                    padding:10px 18px;border-radius:8px;font-size:14px;">Open call</a>
        </div>`
            : "";

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Call summary</title></head>
<body style="margin:0;padding:24px;background:#f6f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#11151c;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eef0f3;">
    <tr>
      <td style="padding:20px 24px;background:linear-gradient(90deg,#06b6d4,#7c3aed);color:#ffffff;font-weight:700;font-size:16px;">
        📞 ${agentName || "Call Agent"} — call summary
      </td>
    </tr>
    <tr>
      <td style="padding:24px;font-size:15px;line-height:1.55;color:#11151c;">
        ${bodyHtml || ""}
        ${
            actionsRows
                ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border:1px solid #eef0f3;border-radius:8px;overflow:hidden;">
                     ${actionsRows}
                   </table>`
                : ""
        }
        ${ctaButton}
      </td>
    </tr>
    <tr>
      <td style="padding:14px 24px;background:#fafbfd;border-top:1px solid #eef0f3;font-size:12px;color:#8b95a5;">
        Sent by Doweit Voice · automated post-call notification
      </td>
    </tr>
  </table>
</body></html>`;
}

export async function sendEmail({
    config,
    to,
    cc,
    bcc,
    subject,
    body, // already-rendered template body
    ctx,
    agentName,
}) {
    const transport = buildTransport(config);
    const fromAddress = config.fromEmail || config.user;
    const fromName = config.fromName || agentName || "Doweit Voice";
    const html = buildHtmlEmail({ bodyHtml: bodyToHtml(body), ctx, agentName });

    const result = await transport.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to,
        cc: cc || undefined,
        bcc: bcc || undefined,
        subject: subject || `Call summary — ${agentName || "Call Agent"}`,
        text: body || "",
        html,
    });

    transport.close();
    return result;
}
