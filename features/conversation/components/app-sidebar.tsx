"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  MoreHorizontalIcon,
  PencilIcon,
  PinIcon,
  PinOffIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useConversations,
  useDeleteConversation,
  useUpdateConversation,
} from "@/features/conversation/hooks/use-conversation";
import { cn } from "@/lib/utils";

type Conversation = NonNullable<
  ReturnType<typeof useConversations>["data"]
>[number];

/**
 * Main application sidebar — logo, new chat, conversation list, theme toggle, and account.
 */
export function AppSidebar() {
  const pathname = usePathname();
  const { data: conversations, isLoading } = useConversations();

  
// Get the active conversation id from the pathname (e.g. /c/123)
// pathname.split("/")[2] is the third part of the pathname (the conversation id)
//  firstparam = / , secondparam = c , thirdparam = 123
  const activeId = pathname.startsWith("/c/")
    ? pathname.split("/")[2]
    : undefined;

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="font-semibold tracking-tight"
              render={<Link href="/" />}
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground">
                C
              </span>
              <span className="group-data-[collapsible=icon]:hidden">ChaiGPT</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="New chat" render={<Link href="/" />}>
              <PlusIcon />
              <span>New chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {isLoading ? (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Chats</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {Array.from({ length: 5 }).map((_, index) => (
                  <SidebarMenuItem key={index}>
                    <Skeleton className="h-8 w-full" />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : !conversations?.length ? (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Chats</SidebarGroupLabel>
            <SidebarGroupContent>
              <p className="px-3 py-2 text-xs text-muted-foreground">No chats yet</p>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <>
            {/* Pinned section */}
            {conversations.some((c) => c.isPinned) && (
              <SidebarGroup className="group-data-[collapsible=icon]:hidden py-1">
                <SidebarGroupLabel className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/80">
                  <PinIcon className="size-3 text-primary rotate-45" />
                  <span>Pinned</span>
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {conversations
                      .filter((c) => c.isPinned)
                      .map((conversation) => (
                        <ChatItem
                          key={conversation.id}
                          conversation={conversation}
                          isActive={activeId === conversation.id}
                        />
                      ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Recent section */}
            <SidebarGroup className="group-data-[collapsible=icon]:hidden py-1">
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80">
                {conversations.some((c) => c.isPinned) ? "Recent" : "Chats"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {conversations
                    .filter((c) => !c.isPinned)
                    .map((conversation) => (
                      <ChatItem
                        key={conversation.id}
                        conversation={conversation}
                        isActive={activeId === conversation.id}
                      />
                    ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarFooterMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

/** Single sidebar row for a conversation with rename, pin, and delete actions. */
function ChatItem({
  conversation,
  isActive,
}: {
  conversation: Conversation;
  isActive: boolean;
}) {
  const updateConversation = useUpdateConversation();
  const deleteConversation = useDeleteConversation(
    isActive ? conversation.id : undefined
  );
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(conversation.title);

  /** Opens the rename dialog, pre-filled with the current title. */
  function openRename() {
    setRenameValue(conversation.title);
    setRenameOpen(true);
  }

  /** Persists the new title if it changed, then closes the dialog. */
  function submitRename() {
    const next = renameValue.trim();
    if (next && next !== conversation.title) {
      updateConversation.mutate({ id: conversation.id, title: next });
    }
    setRenameOpen(false);
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={conversation.title}
        render={<Link href={`/c/${conversation.id}`} />}
        className={cn(
          "transition-all duration-200 rounded-lg hover:bg-sidebar-accent/50",
          isActive && "bg-sidebar-accent/70 text-sidebar-accent-foreground font-semibold border-l-2 border-primary pl-2.5 rounded-l-none"
        )}
      >
        <span className="truncate">{conversation.title}</span>
      </SidebarMenuButton>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuAction
              showOnHover
              className="data-popup-open:bg-sidebar-accent cursor-pointer"
            />
          }
        >
          <MoreHorizontalIcon />
          <span className="sr-only">Chat actions</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem onClick={openRename}>
            <PencilIcon />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              updateConversation.mutate({
                id: conversation.id,
                isPinned: !conversation.isPinned,
              })
            }
          >
            {conversation.isPinned ? <PinOffIcon /> : <PinIcon />}
            {conversation.isPinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => deleteConversation.mutate(conversation.id)}
          >
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitRename();
            }}
          >
            <DialogHeader>
              <DialogTitle>Rename chat</DialogTitle>
            </DialogHeader>
            <Input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="mt-4"
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRenameOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarMenuItem>
  );
}

/** Footer menu with clickable Clerk user account button and name label. */
function SidebarFooterMenu() {
  const { user } = useUser();
  const clerk = useClerk();

  const displayName = user
    ? user.fullName || user.firstName || user.username || "Account"
    : "Account";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <button
          type="button"
          onClick={() => clerk.openUserProfile()}
          className="flex w-full items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-sidebar-accent/50 transition-colors cursor-pointer group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <div onClick={(e) => e.stopPropagation()}>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-8",
                },
              }}
            />
          </div>
          <div className="flex flex-col min-w-0 text-left leading-normal group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold text-foreground">
              {displayName}
            </span>
            <span className="truncate text-[10px] text-muted-foreground font-medium">
              Manage account
            </span>
          </div>
        </button>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
