// lib/integrations/adapters/calcom.js
//
// Cal.com REST API v2 wrapper.
//
// IMPORTANT: Cal.com v1 was decommissioned in 2025; the working API is v2.
//   - Auth is `Authorization: Bearer <apiKey>` (NOT a query param like v1)
//   - Each endpoint pins a `cal-api-version` schema version header
//   - Responses are wrapped: { status: "success" | "error", data: ... }
//
// Connection payload stored in userConnections:
//   { apiKey, baseUrl }   // baseUrl defaults to https://api.cal.com/v2

const DEFAULT_BASE = "https://api.cal.com/v2";

// Schema versions — these pin the response shape for each endpoint per
// Cal.com's API versioning model. Update these when Cal.com publishes a
// breaking change to a particular endpoint.
const VERSIONS = {
    me: "2024-08-13",
    eventTypes: "2024-06-14",
    slots: "2024-09-04",
    bookings: "2024-08-13",
};

function urlFor(conn, path) {
    const base = (conn?.baseUrl || DEFAULT_BASE).replace(/\/$/, "");
    return `${base}${path}`;
}

async function calRequest(conn, method, path, { query, body, version } = {}) {
    if (!conn?.apiKey) throw new Error("Cal.com is not connected");

    const url = new URL(urlFor(conn, path));
    if (query) {
        Object.entries(query).forEach(([k, v]) => {
            if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
        });
    }

    const headers = {
        Authorization: `Bearer ${conn.apiKey}`,
        "Content-Type": "application/json",
    };
    if (version) headers["cal-api-version"] = version;

    const res = await fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let json;
    try {
        json = text ? JSON.parse(text) : {};
    } catch {
        json = { raw: text };
    }

    if (!res.ok || json?.status === "error") {
        const err = new Error(
            json?.error?.message ||
                json?.message ||
                `cal.com ${res.status} ${res.statusText}`,
        );
        err.detail = json;
        err.status = res.status;
        throw err;
    }
    // Some v2 endpoints wrap the payload in { status, data }; others return raw.
    return json?.data !== undefined ? json.data : json;
}

// Validate creds by fetching the authenticated user's account info.
export async function validateApiKey(conn) {
    return calRequest(conn, "GET", "/me", { version: VERSIONS.me });
}

// List the user's event types. v2 returns array of objects with `eventTypes`
// nested under groups, but the flat /event-types endpoint also exists.
export async function listEventTypes(conn) {
    const data = await calRequest(conn, "GET", "/event-types", {
        version: VERSIONS.eventTypes,
    });
    // v2 may return { eventTypeGroups: [{ eventTypes: [...] }] } or a flat list.
    if (Array.isArray(data?.eventTypes)) return data.eventTypes;
    if (Array.isArray(data?.eventTypeGroups)) {
        return data.eventTypeGroups.flatMap((g) => g.eventTypes || []);
    }
    if (Array.isArray(data)) return data;
    return [];
}

// Find available slots in a date range. v2 expects `start`/`end` ISO strings
// (UTC) plus `eventTypeId`.
export async function findSlots(conn, { eventTypeId, dateFrom, dateTo, timeZone }) {
    const data = await calRequest(conn, "GET", "/slots", {
        version: VERSIONS.slots,
        query: {
            eventTypeId,
            start: dateFrom,
            end: dateTo,
            timeZone,
        },
    });
    // v2 shape: { "2026-05-04": [{ start: "2026-05-04T09:00:00Z" }] }
    return data || {};
}

// Create a booking. v2 schema uses `attendee` object + `start` (ISO).
export async function createBooking(conn, params) {
    const {
        eventTypeId,
        start,
        attendeeName,
        attendeeEmail,
        attendeePhone,
        notes,
        timeZone = "UTC",
        language = "en",
        metadata = {},
    } = params;

    const attendee = {
        name: attendeeName || "Caller",
        email: attendeeEmail || "no-email@unknown.local",
        timeZone,
        language,
    };
    if (attendeePhone) attendee.phoneNumber = attendeePhone;

    return calRequest(conn, "POST", "/bookings", {
        version: VERSIONS.bookings,
        body: {
            eventTypeId,
            start,
            attendee,
            metadata,
            ...(notes ? { bookingFieldsResponses: { notes } } : {}),
        },
    });
}

// List bookings within a window. v2 uses `afterStart` / `beforeEnd` query keys.
export async function listBookings(conn, { dateFrom, dateTo } = {}) {
    const data = await calRequest(conn, "GET", "/bookings", {
        version: VERSIONS.bookings,
        query: {
            afterStart: dateFrom,
            beforeEnd: dateTo,
            // status default: any
        },
    });
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.bookings)) return data.bookings;
    return [];
}

// Cancel a booking — v2 uses POST /bookings/:id/cancel with reason in body.
export async function cancelBooking(conn, bookingId, reason) {
    return calRequest(conn, "POST", `/bookings/${bookingId}/cancel`, {
        version: VERSIONS.bookings,
        body: { cancellationReason: reason || "Rescheduled by agent" },
    });
}
