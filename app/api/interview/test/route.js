// Test endpoint for device check internet connectivity
export async function GET() {
    return new Response('OK', { status: 200 });
}

export async function HEAD() {
    return new Response(null, { status: 200 });
}
