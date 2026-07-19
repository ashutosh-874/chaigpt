"use server"

import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache";

export type ConversationListItem = {
    id:             string;
    title:          string;
    isPinned:       boolean;
    isArchived:     boolean;
    lastMessageAt:  Date;
    createdAt:      Date;
    updatedAt:      Date;
};

/** Throws if the conversation doesn't exist or isn't owned by userId. Returns it otherwise. */
export async function assertOwnsConversation(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            userId
        }
    });
    if (!conversation) {
        throw new Error("Conversation not found")
    }
    return conversation
}



/** Loads one conversation, including its parent (if it's a branch). */
export async function getConversation(conversationId: string) {
    const user = await requireUser();
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            userId: user.id
        },
        include: {
            parentConversation: {
                select: {
                    id: true,
                    title: true
                }
            },
            branchedFromMessage: {
                select: {
                    id: true
                }
            }
        }
    });

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    return conversation;
}

/** Maps each message ID to the conversations branched from it. */
export async function loadMessageBranches(conversationId: string): Promise<Record<string, { id: string; title: string }[]>> {
    const user = await requireUser();
    await assertOwnsConversation(conversationId, user.id);

    const messages = await prisma.message.findMany({
        where: { conversationId },
        select: {
            id: true,
            branches: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    });

    const record: Record<string, { id: string; title: string }[]> = {};
    for (const m of messages) {
        if (m.branches.length > 0) {
            record[m.id] = m.branches;
        }
    }

    return record;
}



/** Lists the current user's conversations, pinned first then most recent. */
export async function listConversations(): Promise<ConversationListItem[]> {

    const user = await requireUser();

    return await prisma.conversation.findMany({
        where: {userId: user.id, isArchived: false},
        orderBy: [{ isPinned: "desc" }, { lastMessageAt: "desc" }],
        select: {
            id:             true,
            title:          true,
            isPinned:       true,
            isArchived:     true,
            lastMessageAt:  true,
            createdAt:      true,
            updatedAt:      true,
        },
    })

}


/** Creates a new conversation for the current user. */
export async function createConversation(title = "New Chat") {
    const user = await requireUser();

    return prisma.conversation.create({
        data: {
            userId: user.id,
            title: title.trim() || "New Chat",
        },
    });
}


/** Updates title/pin/archive state on a conversation the user owns. */
export async function updateConversation(
    conversationId: string,
    data: { title?: string; isPinned?: boolean; isArchived?: boolean }
  ) {
    const user = await requireUser();
    await assertOwnsConversation(conversationId, user.id);
  
    const conversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        ...(data.title !== undefined ? { title: data.title.trim() || "New Chat" } : {}),
        ...(data.isPinned !== undefined ? { isPinned: data.isPinned } : {}),
        ...(data.isArchived !== undefined ? { isArchived: data.isArchived } : {}),
      },
    });
  
    revalidatePath("/");
    revalidatePath(`/c/${conversationId}`);
    return conversation;
  }
  


/** Deletes a conversation the user owns, cascading its messages. */
export async function deleteConversation(conversationId: string) {
    const user = await requireUser();
    await assertOwnsConversation(conversationId, user.id);

    await prisma.conversation.delete({
        where: { id: conversationId },
    });

    revalidatePath("/");
    return { id: conversationId };
}