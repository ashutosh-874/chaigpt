import type { HTMLAttributes } from "react";
import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Props for the {@link Loader} spinner component. */
export type LoaderProps = HTMLAttributes<HTMLDivElement> & {
  size?: number;
};

/** Spinning loading indicator — used for small inline states (e.g. tool calls). */
export const Loader = ({ className, size = 16, ...props }: LoaderProps) => (
  <div
    className={cn("inline-flex items-center justify-center", className)}
    {...props}
  >
    <Loader2Icon className="animate-spin" size={size} />
  </div>
);

/** Three-dot typing indicator — used while waiting for the assistant's reply. */
export const TypingIndicator = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center gap-1 px-1 py-1.5", className)} {...props}>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="size-1.5 rounded-full bg-muted-foreground/70"
        style={{
          animation: "typing-dot 1.2s ease-in-out infinite",
          animationDelay: `${i * 0.15}s`,
        }}
      />
    ))}
  </div>
);
