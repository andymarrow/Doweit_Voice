// app/characterai/chat/[characterid]/layout.jsx
//
// Server Component layout — resolves either form of the character id
// (publicId UUID or legacy integer) and redirects to the publicId variant
// when needed. The visual chrome that used to live here moved to
// ChatRoomShell so this file can stay server-side.

import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { findCharacter, maybeRedirectLegacyId } from "@/lib/utils/publicId";
import ChatRoomShell from "./_components/ChatRoomShell";

export default async function ChatRoomLayout({ children, params }) {
	const headersList = await headers();
	const raw = params.characterid;
	if (!raw) notFound();

	const character = await findCharacter(raw);
	if (!character) notFound();

	await maybeRedirectLegacyId({
		raw,
		publicId: character.publicId,
		prefix: "/characterai/chat",
		headersList,
	});

	return <ChatRoomShell>{children}</ChatRoomShell>;
}
