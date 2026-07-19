"use client";
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useQueryClient } from '@tanstack/react-query';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { useChat } from "@ai-sdk/react"
import React, { useMemo, useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConversations, useUpdateConversation } from '../hooks/use-conversation';
import { queryKeys } from '../utils/query-keys';
import { toast } from 'sonner';
import { ChatEmpty } from './chat-empty';
import { ChatMessages } from './chat-messages';
import { ChatComposer } from './chat-composer';

type ConversationViewProps = {
    conversationId: string;
    initialMessages: UIMessage[];
    conversation: {
        id: string;
        title: string;
        model: string | null;
        systemPrompt: string | null;
        parentConversationId: string | null;
        branchedFromMessageId: string | null;
        parentConversation?: { id: string; title: string } | null;
    };
    messageBranches: Record<string, { id: string; title: string }[]>;
    messageMetadata: Record<string, { originalMessageId?: string }>;
};

/**
 * Main chat view — header, message list (or empty state), and composer with streaming.
 */
export const ConversationView = ({
    conversationId,
    initialMessages,
    conversation,
    messageBranches,
    messageMetadata
}: ConversationViewProps) => {

    const queryClient = useQueryClient();
    const { data: conversations } = useConversations();
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    const transport = useMemo(() => new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ id, messages }) => ({
            body: {
                id, message: messages.at(-1)
            }
        })
    }), []);

    const { messages, sendMessage, status } = useChat({
        id: conversationId,
        messages: initialMessages,
        transport,
        onFinish: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all,
            });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    })
    const title =
    conversations?.find((item) => item.id === conversationId)?.title ?? "Chat";

    const updateConversation = useUpdateConversation();
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState(title);

    /** Enters rename mode, pre-filled with the current title. */
    function startRename() {
        setRenameValue(title);
        setIsRenaming(true);
    }

    /** Persists the new title if it changed, then exits rename mode. */
    function submitRename() {
        const next = renameValue.trim();
        if (next && next !== title) {
            updateConversation.mutate({ id: conversationId, title: next });
        }
        setIsRenaming(false);
    }

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col">
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/65 bg-background/80 backdrop-blur-md px-4 z-10">
                <div className="flex items-center gap-2 min-w-0">
                    <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
                    <Separator orientation="vertical" className="mx-2 h-4 bg-border/80" />
                    {isRenaming ? (
                        <Input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={submitRename}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    submitRename();
                                } else if (e.key === "Escape") {
                                    e.preventDefault();
                                    setIsRenaming(false);
                                }
                            }}
                            className="h-7 max-w-64 text-sm font-semibold"
                        />
                    ) : (
                        <h1
                            onClick={startRename}
                            className="truncate text-sm font-semibold text-foreground tracking-tight cursor-text rounded-md px-1 -mx-1 hover:bg-accent/60 transition-colors"
                            title="Click to rename"
                        >
                            {title}
                        </h1>
                    )}
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                    aria-label="Toggle theme"
                >
                    {mounted ? (
                        resolvedTheme === "dark" ? (
                            <SunIcon className="size-4 text-amber-500" />
                        ) : (
                            <MoonIcon className="size-4 text-violet-500" />
                        )
                    ) : (
                        <span className="size-4" />
                    )}
                </Button>
            </header>

            {messages.length === 0 ? (
                <ChatEmpty onSelectPrompt={(text) => void sendMessage({ text })} />
            ) : (
                <ChatMessages
                    messages={messages}
                    status={status}
                    conversationId={conversationId}
                    branchedFromMessageId={conversation.branchedFromMessageId}
                    parentConversation={conversation.parentConversation}
                    messageBranches={messageBranches}
                    messageMetadata={messageMetadata}
                />
            )}

            <ChatComposer
                onSend={(text) => {
                    void sendMessage({ text });
                }}
                isSending={status !== "ready"}
                autoFocus
            />
        </div>
    )
}
