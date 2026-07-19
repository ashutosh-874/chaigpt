"use client";

import React from "react";
import { isToolUIPart, type UIMessage } from "ai";
import type { ChatStatus } from "ai";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
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
import { MoreHorizontal, GitBranch } from "lucide-react";
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
  const isWaiting =
    status === "submitted" && messages.at(-1)?.role === "user";

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

  return (
    <Conversation>
      <ConversationContent className="py-8">
        {messages.map((message) => (
          <React.Fragment key={message.id}>
            <Message from={message.role}>
              <MessageContent>
                {message.parts.map((part, i) => {
                  if (part.type === "text") {
                    return <MessageResponse key={i}>{part.text}</MessageResponse>;
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
                            <ul className="space-y-1">
                              {(
                                part.output as {
                                  results: { title: string; url: string }[];
                                }
                              ).results.map((result) => (
                                <li key={result.url}>
                                  <a
                                    href={result.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline"
                                  >
                                    {result.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </ToolContent>
                      </Tool>
                    );
                  }

                  return null;
                })}
              </MessageContent>
              {message.role === "assistant" && (
                <MessageActions className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 self-end flex items-center gap-2">
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
                        align="end"
                        className="w-max max-w-xs whitespace-nowrap"
                      >
                        {messageBranches[message.id].map((branch) => (
                          <DropdownMenuItem
                            key={branch.id}
                            render={<Link href={`/c/${branch.id}`} />}
                          >
                            <span>{branch.title}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <MessageAction label="More options" size="icon-sm">
                          <MoreHorizontal className="size-4" />
                        </MessageAction>
                      }
                    />
                    <DropdownMenuContent
                      align="end"
                      className="w-max whitespace-nowrap"
                    >
                      <DropdownMenuItem onClick={() => handleBranch(message.id)}>
                        <GitBranch className="size-4" />
                        <span>Create new branch</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
    </Conversation>
  );
}
