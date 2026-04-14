// app/interview/[agentid]/layout.jsx
//
// Server Component wrapper for the public candidate-facing interview page.
// Resolves the agent's id (publicId or legacy integer) and redirects to
// the publicId variant when needed. Critical for this route specifically:
// it's an unauthenticated magic link, so the integer form would let anyone
// enumerate /interview/1, /interview/2, etc.

import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { findCallAgent, maybeRedirectLegacyId } from "@/lib/utils/publicId";

export default async function InterviewLayout({ children, params }) {
	const headersList = await headers();
	const raw = params.agentid;
	if (!raw) notFound();

	const agent = await findCallAgent(raw);
	if (!agent) notFound();

	await maybeRedirectLegacyId({
		raw,
		publicId: agent.publicId,
		prefix: "/interview",
		headersList,
	});

	return <>{children}</>;
}
