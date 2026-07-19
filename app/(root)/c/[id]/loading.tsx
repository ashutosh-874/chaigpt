import { Skeleton } from "@/components/ui/skeleton";

/** Shown while a conversation's messages are being fetched from the server. */
export default function ConversationLoading() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/65 px-4">
        <Skeleton className="size-7 rounded-lg" />
        <Skeleton className="h-4 w-40 rounded-md" />
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8">
        <Skeleton className="ml-auto h-9 w-2/5 rounded-2xl" />
        <Skeleton className="h-24 w-4/5 rounded-2xl" />
        <Skeleton className="ml-auto h-9 w-1/3 rounded-2xl" />
        <Skeleton className="h-16 w-3/5 rounded-2xl" />
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 pb-4">
        <Skeleton className="h-14 w-full rounded-3xl" />
      </div>
    </div>
  );
}
