// app/callagents/knowledgebase/[knowledgebaseid]/layout.jsx
//
// Server Component wrapper that resolves either form of the KB id (publicId
// or legacy integer) and redirects to the publicId variant when needed.
// The actual page is a client component below this.

import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { findKnowledgeBase, maybeRedirectLegacyId } from "@/lib/utils/publicId";

export default async function KnowledgeBaseDetailPageLayout({ children, params }) {
	const headersList = await headers();
	const raw = params.knowledgebaseid;
	if (!raw) notFound();

	const kb = await findKnowledgeBase(raw);
	if (!kb) notFound();

	await maybeRedirectLegacyId({
		raw,
		publicId: kb.publicId,
		prefix: "/callagents/knowledgebase",
		headersList,
	});

	return <div>{children}</div>;
}
