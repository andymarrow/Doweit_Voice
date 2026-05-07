// lib/integrations/adapters/vapiNumbers.js
//
// Vapi phone-number management. Vapi exposes two capabilities we use here:
//   1. Native Vapi-hosted numbers — created via POST /phone-number with
//      provider:'vapi' (or imported automatically when buying through Vapi).
//   2. BYO Twilio numbers — POST /phone-number with provider:'twilio' +
//      twilioAccountSid/authToken/phoneNumber. Vapi takes over routing for
//      that number to the assigned assistant.
//
// All requests use the server-side VAPI_SECRET_KEY env var.

const VAPI_BASE = "https://api.vapi.ai";

function authHeader() {
    const key = process.env.VAPI_SECRET_KEY;
    if (!key) throw new Error("VAPI_SECRET_KEY is not set");
    return `Bearer ${key}`;
}

async function vapiRequest(method, path, body) {
    const res = await fetch(`${VAPI_BASE}${path}`, {
        method,
        headers: {
            Authorization: authHeader(),
            "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json;
    try {
        json = text ? JSON.parse(text) : {};
    } catch {
        json = { raw: text };
    }
    if (!res.ok) {
        const err = new Error(
            json?.message?.[0] || json?.message || json?.error || `vapi ${res.status}`,
        );
        err.detail = json;
        err.status = res.status;
        throw err;
    }
    return json;
}

// Fetch a single Vapi phone-number record by its Vapi ID.
export async function getVapiNumber(vapiNumberId) {
    return vapiRequest("GET", `/phone-number/${vapiNumberId}`);
}

// List all phone numbers known to Vapi for our account. Includes both BYO
// imports and native Vapi-hosted.
export async function listVapiNumbers() {
    const list = await vapiRequest("GET", "/phone-number");
    return Array.isArray(list) ? list : [];
}

// Import a BYO Twilio number into Vapi so Vapi can route inbound calls.
// Returns the Vapi phone-number record (use its `id` to assign assistants).
export async function importTwilioNumber({ twilioAccountSid, twilioAuthToken, phoneNumber, name }) {
    return vapiRequest("POST", "/phone-number", {
        provider: "twilio",
        number: phoneNumber,
        name: name || phoneNumber,
        twilioAccountSid,
        twilioAuthToken,
    });
}

// Update the assistantId on an existing Vapi phone-number record.
// Pass `null` to unassign.
export async function setAssistantOnNumber(vapiNumberId, assistantId) {
    return vapiRequest("PATCH", `/phone-number/${vapiNumberId}`, {
        assistantId: assistantId || null,
    });
}

// Delete a phone-number record from Vapi (BYO or native). For BYO Twilio
// numbers this releases Vapi's claim — the underlying Twilio number is not
// deleted on Twilio's side.
export async function deleteVapiNumber(vapiNumberId) {
    return vapiRequest("DELETE", `/phone-number/${vapiNumberId}`);
}

// Place an outbound call from a Vapi-managed number using a given assistant.
// Used by the "Call my phone" test action on the agent dashboard.
export async function makeOutboundCall({ phoneNumberId, assistantId, customerNumber, customerName, metadata }) {
    return vapiRequest("POST", "/call/phone", {
        phoneNumberId,
        assistantId,
        customer: { number: customerNumber, name: customerName },
        metadata: metadata || {},
    });
}

// Fetch a single call by id. Used to check whether a placed call actually
// rang vs. was rejected at the carrier (Twilio trial accounts reject calls
// to numbers that aren't on the verified caller-ID list).
export async function getCallStatus(callId) {
    return vapiRequest("GET", `/call/${callId}`);
}

// Lightweight on-demand assistant creation — used when "Call my phone" needs
// an assistant configured for the agent without persisting one. Returns the
// new Vapi assistantId.
export async function createTransientAssistant(config) {
    const res = await vapiRequest("POST", "/assistant", config);
    return res.id;
}
