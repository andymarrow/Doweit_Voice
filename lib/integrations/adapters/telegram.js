// lib/integrations/adapters/telegram.js
//
// Telegram Bot API wrapper. Bot token is stored under provider='telegram';
// per-agent rule destination holds the chat ID (group or DM).
//
// Messages are sent with parse_mode=HTML. HTML is far more lenient than
// MarkdownV2 — only &, <, > need escaping in plain text, so any rendered
// template body (dates, dashes, dots, etc.) works without special handling.

const TELEGRAM_API = "https://api.telegram.org";

// Escape plain text for Telegram HTML mode. Only three chars need it.
function escapeHtml(text) {
    if (text === null || text === undefined) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

async function tgRequest(token, method, body) {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!json.ok) {
        const err = new Error(json.description || "telegram_unknown_error");
        err.detail = json;
        throw err;
    }
    return json.result;
}

// Validate a bot token by calling getMe. Returns the bot info.
export async function validateBotToken(token) {
    return tgRequest(token, "getMe", {});
}

// Send a message. `text` is the already-rendered template body.
// We wrap it in a header + optional action breakdown + optional link.
export async function sendTelegramMessage({ token, chatId, text, includeActions, ctx, agentName }) {
    const lines = [];

    if (agentName) {
        lines.push(`📞 <b>${escapeHtml(agentName)}</b> — call summary`);
        lines.push("");
    }

    if (text) {
        // Escape the rendered body so arbitrary content (dates, dashes, phone
        // numbers, etc.) never triggers a parse error.
        lines.push(escapeHtml(text));
    }

    if (includeActions && ctx?._actionsList?.length) {
        lines.push("");
        for (const a of ctx._actionsList.slice(0, 10)) {
            lines.push(`• <b>${escapeHtml(a.displayName)}</b>: ${escapeHtml(a.value)}`);
        }
    }

    if (ctx?.call?.transcriptUrl && ctx.call.transcriptUrl !== "—") {
        lines.push("");
        lines.push(`<a href="${ctx.call.transcriptUrl}">Open call</a>`);
    }

    return tgRequest(token, "sendMessage", {
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "HTML",
        disable_web_page_preview: true,
    });
}
