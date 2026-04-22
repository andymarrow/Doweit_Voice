// app/callagents/[agentid]/layout.jsx
import { notFound } from "next/navigation";
import AgentDetailLayoutClient from "./AgentLayoutClient";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { findCallAgent, maybeRedirectLegacyId } from "@/lib/utils/publicId";

// Server Component layout that fetches the agent server-side and wraps the
// client tree. Accepts `agentid` as either the new publicId UUID or the
// legacy integer id; in the legacy case it redirects the user to the
// publicId variant so old URLs upgrade automatically.
export default async function AgentDetailLayout({ children, params }) {
	const headersList = await headers();
	const { user } = await getSession(headersList);
	const userId = user?.id;
	if (!userId) notFound();

	const raw = params.agentid;
	if (!raw) notFound();

	const agent = await findCallAgent(raw, {
		with: { knowledgeBase: true },
	});
	if (!agent || agent.creatorId !== userId) notFound();

	await maybeRedirectLegacyId({
		raw,
		publicId: agent.publicId,
		prefix: "/callagents",
		headersList,
	});

	return (
		<AgentDetailLayoutClient agent={agent}>{children}</AgentDetailLayoutClient>
	);
}
