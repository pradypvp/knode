"use client";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100dvh-3.5rem)] flex-1 flex-col overflow-hidden lg:flex-row">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.55_0.22_280/0.35),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-[min(70vh,560px)] w-[min(90vw,560px)] translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle,oklch(0.5_0.15_200/0.25),transparent_65%)] blur-2xl"
      />
      <div className="relative z-[1] flex flex-1 flex-col justify-center px-4 py-12 sm:px-8 lg:max-w-lg lg:px-12 lg:py-16">
        <div className="mb-8 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Knode
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>
        {children}
      </div>
      <div className="relative z-[1] hidden flex-1 flex-col justify-center border-t border-white/5 bg-black/20 px-12 py-16 lg:flex lg:border-l lg:border-t-0">
        <ul className="max-w-sm space-y-4 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_12px_oklch(0.72_0.19_280)]" />
            <span>
              <strong className="text-foreground">Graph + AI ranking</strong> —
              skills, credibility, and bridging paths inform every match.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-chart-2 shadow-[0_0_10px_oklch(0.65_0.14_200)]" />
            <span>
              <strong className="text-foreground">Karma & SOS</strong> — ledger
              transfers and live help when deadlines hit.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/40" />
            <span>
              <strong className="text-foreground">Built for demos & prod</strong>{" "}
              — same stack from signup to socket events.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
