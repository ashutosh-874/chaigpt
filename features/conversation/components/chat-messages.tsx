"use client";

import React from "react";
import { isToolUIPart, type UIMessage } from "ai";
import type { ChatStatus } from "ai";

import {
  Conversation,
  ConversationContent,
  ScrollToBottomOnMount,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import { Tool, ToolHeader, ToolContent } from "@/components/ai-elements/tool";
import { Loader } from "@/components/ai-elements/loader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CopyIcon, GitBranch } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useBranchConversation } from "@/features/conversation/hooks/use-conversation";

type ChatMessagesProps = {
  messages: UIMessage[];
  status: ChatStatus;
  conversationId: string;
  branchedFromMessageId: string | null;
  parentConversation?: { id: string; title: string } | null;
  messageBranches: Record<string, { id: string; title: string }[]>;
  messageMetadata: Record<string, { originalMessageId?: string }>;
};

/**
 * Renders the conversation message list with markdown responses and a loading indicator.
 */
export function ChatMessages({
  messages,
  status,
  conversationId,
  branchedFromMessageId,
  parentConversation,
  messageBranches,
  messageMetadata,
}: ChatMessagesProps) {
  const lastMessage = messages.at(-1);
  const isWaiting =
    status !== "ready" &&
    (status === "submitted" || status === "streaming") &&
    (lastMessage?.role === "user" ||
      (lastMessage?.role === "assistant" &&
        (!lastMessage.parts ||
          !lastMessage.parts.some(
            (part) => part.type === "text" && part.text.trim().length > 0
          ))));

  const branchMutation = useBranchConversation();

  const handleBranch = (msgId: string) => {
    toast.promise(
      branchMutation.mutateAsync({ conversationId, messageId: msgId }),
      {
        loading: "Creating branch...",
        success: "Chat branched!",
        error: "Failed to create branch",
      }
    );
  };

  const handleCopy = (message: UIMessage) => {
    const text = message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("");
    void navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <Conversation>
      <ConversationContent className="mx-auto w-full max-w-3xl py-8">
        {messages.map((message) => (
          <React.Fragment key={message.id}>
            <Message from={message.role}>
              <MessageContent>
                {message.parts.map((part, i) => {
                  if (part.type === "text") {
                    const isLastMessage = message.id === messages.at(-1)?.id;
                    const isStreaming = isLastMessage && status === "streaming";
                    return (
                      <MessageResponse key={i} isAnimating={isStreaming}>
                        {part.text}
                      </MessageResponse>
                    );
                  }

                  if (isToolUIPart(part) && part.type === "tool-webSearch") {
                    return (
                      <Tool key={part.toolCallId} state={part.state}>
                        <ToolHeader
                          state={part.state}
                          query={(part.input as { query?: string } | undefined)?.query}
                        />
                        <ToolContent>
                          {part.state === "output-error" && (
                            <p className="text-destructive">{part.errorText}</p>
                          )}
                          {part.state === "output-available" && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 w-full">
                              {(
                                part.output as {
                                  results: { title: string; url: string }[];
                                }
                              ).results.map((result) => {
                                let domain = "";
                                try {
                                  domain = new URL(result.url).hostname.replace("www.", "");
                                } catch {
                                  domain = result.url;
                                }
                                return (
                                  <a
                                    key={result.url}
                                    href={result.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group flex flex-col gap-1.5 p-2.5 rounded-xl border border-border bg-card/60 backdrop-blur-xs hover:bg-accent/40 hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 text-left cursor-pointer shadow-xs hover:shadow-sm"
                                  >
                                    <div className="flex items-center gap-1.5 font-medium text-muted-foreground text-[10px]">
                                      <img
                                        src={`https://www.google.com/s2/favicons?sz=32&domain=${domain}`}
                                        alt=""
                                        className="size-3.5 rounded-xs object-contain bg-white p-0.5 border border-border/80"
                                        onError={(e) => {
                                          e.currentTarget.style.display = "none";
                                        }}
                                      />
                                      <span className="truncate group-hover:text-foreground transition-colors">{domain}</span>
                                    </div>
                                    <span className="font-semibold text-foreground text-xs leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                                      {result.title}
                                    </span>
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </ToolContent>
                      </Tool>
                    );
                  }

                  return null;
                })}
              </MessageContent>
              {message.role === "assistant" && (
                <MessageActions className="pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 self-start flex items-center gap-2">
                  {messageBranches[message.id] && messageBranches[message.id].length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <button
                            type="button"
                            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium cursor-pointer py-1 px-1.5 rounded-md hover:bg-green-500/10 transition-colors"
                          >
                            <GitBranch className="size-3" />
                            <span>
                              {messageBranches[message.id].length}{" "}
                              {messageBranches[message.id].length === 1
                                ? "branch"
                                : "branches"}
                            </span>
                          </button>
                        }
                      />
                      <DropdownMenuContent
                        align="start"
                        className="w-max max-w-xs whitespace-nowrap"
                      >
                        {messageBranches[message.id].map((branch) => (
                          <DropdownMenuItem
                            key={branch.id}
                            className="cursor-pointer"
                            render={<Link href={`/c/${branch.id}`} />}
                          >
                            <span>{branch.title}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  <MessageAction
                    tooltip="Copy"
                    size="icon-sm"
                    onClick={() => handleCopy(message)}
                  >
                    <CopyIcon className="size-4" />
                  </MessageAction>

                  <MessageAction
                    tooltip="Create new branch"
                    size="icon-sm"
                    onClick={() => handleBranch(message.id)}
                  >
                    <GitBranch className="size-4" />
                  </MessageAction>
                </MessageActions>
              )}
            </Message>

            {messageMetadata[message.id]?.originalMessageId === branchedFromMessageId && parentConversation && (
              <div className="my-6 flex items-center gap-2 border-l-2 border-green-500 pl-4 py-2 text-sm text-muted-foreground self-start">
                <GitBranch className="size-4 text-green-500" />
                <span>Branched from</span>
                <Link
                  href={`/c/${parentConversation.id}`}
                  className="underline font-medium text-foreground hover:text-green-600 transition-colors"
                >
                  {parentConversation.title}
                </Link>
              </div>
            )}
          </React.Fragment>
        ))}

        {isWaiting ? (
          <Message from="assistant">
            <MessageContent>
              <Loader />
            </MessageContent>
          </Message>
        ) : null}
      </ConversationContent>
      <ScrollToBottomOnMount />
    </Conversation>
  );
}
