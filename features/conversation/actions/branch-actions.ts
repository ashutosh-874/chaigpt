"use server";

import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@/lib/generated/prisma/client";
import { assertOwnsConversation } from "./conversation-actions";

/**
 * Creates a new conversation branch from a specified message.
 *
 * Copies all messages up to and including the selected message into the new
 * conversation and sets up the branch relationships.
 */
export async function createBranch(conversationId: string, messageId: string): Promise<string> {
	const user = await requireUser();

	// Validate conversation exists and belongs to user
	const conversation = await assertOwnsConversation(conversationId, user.id);

	// Validate message exists
	const selectedMessage = await prisma.message.findUnique({
		where: { id: messageId },
	});

	if (!selectedMessage) {
		throw new Error("Target message for branching not found");
	}

	if (selectedMessage.conversationId !== conversationId) {
		throw new Error("Message does not belong to the source conversation");
	}

	if (selectedMessage.role !== "ASSISTANT") {
		throw new Error("Can only branch from assistant messages");
	}

	// Fetch all messages in the conversation to find the slice till the branching point
	const allMessages = await prisma.message.findMany({
		where: { conversationId },
		orderBy: { createdAt: "asc" },
	});

	const targetIndex = allMessages.findIndex((m) => m.id === messageId);
	if (targetIndex === -1) {
		throw new Error("Selected message not found in conversation history");
	}

	const messagesToCopy = allMessages.slice(0, targetIndex + 1);

	// Execute copy inside a single transaction
	const newConversationId = await prisma.$transaction(async (tx) => {
		// Create new conversation, pointing to original messageId
		const newConversation = await tx.conversation.create({
			data: {
				userId: user.id,
				title: `${conversation.title} (branch)`,
				model: conversation.model,
				systemPrompt: conversation.systemPrompt,
				parentConversationId: conversationId,
				branchedFromMessageId: messageId,
			},
		});

		// Copy messages
		for (const msg of messagesToCopy) {
			const originalMetadata = (msg.metadata as Record<string, any>) || {};
			const newMetadata = {
				...originalMetadata,
				originalMessageId: msg.id,
			};

			await tx.message.create({
				data: {
					conversationId: newConversation.id,
					role: msg.role,
					status: msg.status,
					content: msg.content,
					parts: msg.parts as Prisma.InputJsonValue,
					metadata: newMetadata as Prisma.InputJsonValue,
					createdAt: msg.createdAt,
				},
			});
		}

		return newConversation.id;
	});

	revalidatePath("/");
	revalidatePath(`/c/${newConversationId}`);

	return newConversationId;
}
