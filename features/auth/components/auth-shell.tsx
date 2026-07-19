import Link from "next/link";

/** Branded backdrop shared by the sign-in and sign-up pages. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklch,var(--primary),transparent_88%),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(40%_35%_at_85%_100%,color-mix(in_oklch,var(--chart-1),transparent_92%),transparent)]"
      />

      <div className="relative flex w-full max-w-md flex-col items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-base font-semibold text-primary-foreground">
            C
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            ChaiGPT
          </span>
        </Link>

        <div className="w-full">{children}</div>
      </div>
    </section>
  );
}
