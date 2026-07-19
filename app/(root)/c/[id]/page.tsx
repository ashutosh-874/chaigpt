import { loadChatMessages } from '@/features/ai/actions/chat-store';
import { getConversation, loadMessageBranches } from '@/features/conversation/actions/conversation-actions';
import { ConversationView } from '@/features/conversation/components/conversation-view';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import React from 'react'

type ConversationPageProps = {
	params: Promise<{ id: string }>;
};

/**
 * Conversation page — loads messages and renders the chat UI for a given ID.
 */
const page = async ({ params }: ConversationPageProps) => {
	const { id } = await params;

	let conversation;
	try {
		conversation = await getConversation(id);
	} catch (error) {
		notFound();
	}

	const initialMessages = await loadChatMessages(id);
	const messageBranches = await loadMessageBranches(id);

	// Load originalMessageId from message metadata to track branching points
	const messageMetadataRows = await prisma.message.findMany({
		where: { conversationId: id },
		select: { id: true, metadata: true }
	});

	const messageMetadata: Record<string, { originalMessageId?: string }> = {};
	for (const row of messageMetadataRows) {
		const meta = (row.metadata as Record<string, string | undefined>) || {};
		if (meta.originalMessageId) {
			messageMetadata[row.id] = { originalMessageId: meta.originalMessageId };
		}
	}

	return (
		<ConversationView
			key={id}
			conversationId={id}
			initialMessages={initialMessages}
			conversation={conversation}
			messageBranches={messageBranches}
			messageMetadata={messageMetadata}
		/>
	);
}

export default page