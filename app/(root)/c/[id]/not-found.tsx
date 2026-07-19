import Link from "next/link";
import { MessageSquareOffIcon } from "lucide-react";

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";

/** Shown when a conversation doesn't exist or isn't owned by the current user. */
export default function ConversationNotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <Empty className="border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-primary/10 text-primary">
            <MessageSquareOffIcon />
          </EmptyMedia>
          <EmptyTitle className="text-2xl tracking-tight">
            Chat not found
          </EmptyTitle>
          <EmptyDescription>
            This conversation doesn&apos;t exist, or it isn&apos;t yours to see.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button render={<Link href="/" />}>Start a new chat</Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
