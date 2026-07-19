"use client";

import { useEffect, useState, type ComponentProps } from "react";
import {
	CheckCircle2Icon,
	ChevronDownIcon,
	SearchIcon,
	XCircleIcon,
} from "lucide-react";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Loader } from "@/components/ai-elements/loader";
import { cn } from "@/lib/utils";

export type ToolState =
	| "input-streaming"
	| "input-available"
	| "approval-requested"
	| "approval-responded"
	| "output-available"
	| "output-error"
	| "output-denied";

export type ToolProps = Omit<
	ComponentProps<typeof Collapsible>,
	"open" | "onOpenChange" | "defaultOpen"
> & {
	/** Current tool part state — drives auto-collapse once the search succeeds. */
	state: ToolState;
};

/**
 * Collapsible container for a single tool call/result, e.g. a web search.
 * Stays open while running or on error, and auto-collapses once on success —
 * driven as a controlled Collapsible since `state` changes after mount.
 */
export const Tool = ({ className, state, ...props }: ToolProps) => {
	const [open, setOpen] = useState(state !== "output-available");

	useEffect(() => {
		if (state === "output-available") {
			setOpen(false);
		}
	}, [state]);

	return (
		<Collapsible
			open={open}
			onOpenChange={setOpen}
			className={cn("w-full rounded-lg border bg-muted/30", className)}
			{...props}
		/>
	);
};

export type ToolHeaderProps = {
	state: ToolState;
	query?: string;
};

/** Trigger row showing the tool's current state — searching, done, or failed. */
export const ToolHeader = ({ state, query }: ToolHeaderProps) => (
	<CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-2 text-sm">
		<SearchIcon className="size-4 shrink-0 text-muted-foreground" />
		<span className="flex-1 truncate text-left">
			{state === "output-error"
				? "Search failed"
				: query
					? `Searching the web for "${query}"`
					: "Searching the web"}
		</span>
		{(state === "input-streaming" || state === "input-available") && (
			<Loader size={14} />
		)}
		{state === "output-available" && (
			<CheckCircle2Icon className="size-4 text-green-600" />
		)}
		{state === "output-error" && (
			<XCircleIcon className="size-4 text-destructive" />
		)}
		<ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
	</CollapsibleTrigger>
);

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

/** Body panel holding the tool's results or error message. */
export const ToolContent = ({ className, ...props }: ToolContentProps) => (
	<CollapsibleContent
		className={cn("border-t px-3 py-2 text-sm", className)}
		{...props}
	/>
);
