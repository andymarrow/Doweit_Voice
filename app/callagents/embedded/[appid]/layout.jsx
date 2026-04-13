// app/callagents/embedded/[appid]/layout.jsx
//
// Server Component wrapper that resolves either form of the SDK app id
// (publicId UUID or legacy integer) and redirects to the publicId variant
// when needed. Wraps the client page below.

import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { findSdkApp, maybeRedirectLegacyId } from "@/lib/utils/publicId";

export default async function EmbeddedAppDetailLayout({ children, params }) {
	const headersList = await headers();
	const raw = params.appid;
	if (!raw) notFound();

	const app = await findSdkApp(raw);
	if (!app) notFound();

	await maybeRedirectLegacyId({
		raw,
		publicId: app.publicId,
		prefix: "/callagents/embedded",
		headersList,
	});

	return <>{children}</>;
}
