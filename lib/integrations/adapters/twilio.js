// lib/integrations/adapters/twilio.js
//
// Minimal Twilio REST API client. We avoid pulling the official `twilio` SDK
// to keep the bundle small — Twilio's REST API is straightforward over fetch.
//
// Connection payload stored in userConnections:
//   { accountSid, authToken }

const TW_BASE = "https://api.twilio.com/2010-04-01";

function basicAuth(accountSid, authToken) {
    return "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");
}

async function twRequest(conn, method, path, { query, formBody } = {}) {
    if (!conn?.accountSid || !conn?.authToken) {
        throw new Error("Twilio is not connected");
    }
    const url = new URL(`${TW_BASE}/Accounts/${conn.accountSid}${path}`);
    if (query) {
        Object.entries(query).forEach(([k, v]) => {
            if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
        });
    }
    const init = {
        method,
        headers: {
            Authorization: basicAuth(conn.accountSid, conn.authToken),
        },
    };
    if (formBody) {
        init.headers["Content-Type"] = "application/x-www-form-urlencoded";
        init.body = new URLSearchParams(formBody).toString();
    }

    const res = await fetch(url.toString(), init);
    const text = await res.text();
    let json;
    try {
        json = text ? JSON.parse(text) : {};
    } catch {
        json = { raw: text };
    }
    if (!res.ok) {
        const err = new Error(
            json?.message || json?.detail || `twilio ${res.status} ${res.statusText}`,
        );
        err.detail = json;
        err.status = res.status;
        throw err;
    }
    return json;
}

// Validate creds by fetching the account record.
export async function validateCredentials(conn) {
    return twRequest(conn, "GET", ".json");
}

// List the user's incoming phone numbers.
// Returns array of { sid, phoneNumber, friendlyName, capabilities }.
export async function listIncomingNumbers(conn) {
    const all = [];
    let next = "/IncomingPhoneNumbers.json?PageSize=50";
    while (next) {
        // The first request uses the path normaliser above; subsequent
        // pages come back with a fully-qualified URI we follow directly.
        let res;
        if (next.startsWith("http")) {
            const r = await fetch(next, {
                headers: { Authorization: basicAuth(conn.accountSid, conn.authToken) },
            });
            res = await r.json();
        } else {
            // Strip the /Accounts/<sid> prefix the helper adds back.
            res = await twRequest(conn, "GET", next.replace(/^\/IncomingPhoneNumbers/, "/IncomingPhoneNumbers"));
        }
        for (const n of res.incoming_phone_numbers || []) {
            all.push({
                sid: n.sid,
                phoneNumber: n.phone_number,
                friendlyName: n.friendly_name,
                capabilities: n.capabilities || {},
            });
        }
        next = res.next_page_uri
            ? `https://api.twilio.com${res.next_page_uri}`
            : null;
    }
    return all;
}
