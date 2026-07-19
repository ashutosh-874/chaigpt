import { MessageSquareIcon, SearchIcon, Code2Icon, LightbulbIcon, PenToolIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type ChatEmptyProps = {
  onSelectPrompt: (prompt: string) => void;
};

const SUGGESTED_PROMPTS = [
  {
    icon: SearchIcon,
    title: "Search the web",
    description: "Find the latest tech news or live updates",
    prompt: "Search the web for the latest tech news from today",
    iconClass: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/20",
  },
  {
    icon: Code2Icon,
    title: "Explain code",
    description: "Understand database models or functions",
    prompt: "Explain the difference between SQL and NoSQL databases",
    iconClass: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/20",
  },
  {
    icon: LightbulbIcon,
    title: "Brainstorm ideas",
    description: "Generate startup concepts or creative writing",
    prompt: "Brainstorm 5 unique startup ideas in the renewable energy space",
    iconClass: "text-green-500 bg-green-500/10 dark:bg-green-500/20",
  },
  {
    icon: PenToolIcon,
    title: "Write an email",
    description: "Draft professional messages in seconds",
    prompt: "Write a professional email asking for feedback on a project design",
    iconClass: "text-purple-500 bg-purple-500/10 dark:bg-purple-500/20",
  },
];

/** Empty-state placeholder shown before the first message is sent. */
export function ChatEmpty({ onSelectPrompt }: ChatEmptyProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 max-w-3xl mx-auto w-full overflow-y-auto min-h-0">
      <Empty className="border-0 p-0 w-full">
        <EmptyHeader className="mb-6 max-w-md mx-auto">
          <EmptyMedia variant="icon" className="mb-4 bg-primary/10 text-primary mx-auto">
            <MessageSquareIcon className="size-5" />
          </EmptyMedia>
          <EmptyTitle className="text-3xl tracking-tight font-extrabold text-foreground bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
            How can I help you today?
          </EmptyTitle>
          <EmptyDescription className="text-[15px]">
            Ask anything — replies stream in real time.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-4">
        {SUGGESTED_PROMPTS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className="group flex flex-col items-start gap-2.5 p-4 rounded-xl border border-border/75 bg-card/60 backdrop-blur-xs text-left hover:border-primary/40 hover:bg-accent/40 dark:hover:bg-accent/10 transition-all duration-300 hover:-translate-y-0.5 shadow-xs hover:shadow-sm cursor-pointer"
            >
              <div className={`p-2 rounded-lg ${item.iconClass} transition-colors group-hover:scale-105 duration-300`}>
                <Icon className="size-4.5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
