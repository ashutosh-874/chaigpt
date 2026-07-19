"use client";

import * as React from "react";
import { ArrowUpIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type ChatComposerProps = {
  onSend: (content: string) => Promise<void> | void;
  isSending?: boolean;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
};

/**
 * Message input form with send button. Enter sends; Shift+Enter inserts a newline.
 */
export function ChatComposer({
  onSend,
  isSending = false,
  placeholder = "Message ChaiGPT…",
  className,
  autoFocus = false,
}: ChatComposerProps) {
  const [value, setValue] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus();
    }
  }, [autoFocus]);

  /** Submits the current message when the form is submitted or Enter is pressed. */
  async function handleSubmit(event?: React.FormEvent) {
    event?.preventDefault();
    const content = value.trim();
    if (!content || isSending) return;

    setValue("");
    await onSend(content);
    textareaRef.current?.focus();
  }

  /** Handles keyboard shortcuts — Enter to send, Shift+Enter for a new line. */
  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  }

  const canSend = value.trim().length > 0 && !isSending;

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className={cn("mx-auto w-full max-w-3xl px-4 pb-4 md:px-6", className)}
    >
      <InputGroup className="h-auto min-h-14 rounded-3xl border-border/80 bg-background/80 backdrop-blur-md shadow-md focus-within:border-primary/50 focus-within:ring-3 focus-within:ring-primary/15 transition-all duration-300 dark:bg-input/20">
        <InputGroupAddon align="inline-start" className="pl-4 pb-3 self-end select-none pointer-events-none">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 font-semibold text-[10px] tracking-wide uppercase shadow-2xs border border-emerald-500/20">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500"></span>
            </span>
            <span>Web Search Active</span>
          </div>
        </InputGroupAddon>
        <InputGroupTextarea
          ref={textareaRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isSending}
          rows={1}
          className="max-h-48 min-h-12 py-3.5 pl-2 text-[15px] leading-relaxed"
        />
        <InputGroupAddon align="inline-end" className="pr-2 pb-2 self-end">
          <InputGroupButton
            type="submit"
            size="icon-sm"
            variant="default"
            disabled={!canSend}
            className={cn(
              "size-9 rounded-full transition-all duration-200 active:scale-90 hover:scale-105 cursor-pointer",
              canSend && "bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/20"
            )}
            aria-label="Send message"
          >
            {isSending ? <Spinner /> : <ArrowUpIcon />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        ChaiGPT can make mistakes. Check important info.
      </p>
    </form>
  );
}
