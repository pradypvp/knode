"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { NAV_SECTIONS, PAGE_TITLES } from "./nav-config";
import { formatKarmaDisplay } from "@/lib/format-karma";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const title =
    PAGE_TITLES[pathname] ??
    (pathname.startsWith("/sos/") && pathname.length > 5
      ? "Help session"
      : "Knode");
  const karma = user?.karmaBalance ?? 0;
  const initials =
    user?.name
      ?.split(/\s+/)
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "?";

  return (
    <div className="flex min-h-screen bg-[#0a0613] text-[#f0eeff]">
      <aside className="fixed bottom-0 left-0 top-0 z-[200] hidden w-[236px] flex-col border-r border-[rgba(155,135,245,0.15)] bg-[rgba(10,6,19,0.95)] backdrop-blur-xl md:flex">
        <div className="flex items-center gap-3 border-b border-[rgba(155,135,245,0.15)] px-[22px] pb-[22px] pt-7">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#9b87f5] to-[#6d5ce7] font-[family-name:var(--font-syne)] text-[17px] font-extrabold text-white shadow-[0_0_20px_rgba(155,135,245,0.4)]">
            K
          </div>
          <div className="font-[family-name:var(--font-syne)] text-[19px] font-bold tracking-tight">
            Kno<span className="text-[#9b87f5]">de</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3.5">
          {NAV_SECTIONS.map((sec) => (
            <div key={sec.section}>
              <div className="px-3.5 pb-1.5 pt-2.5 font-mono text-[10px] font-medium uppercase tracking-[1.2px] text-[rgba(240,238,255,0.35)]">
                {sec.section}
              </div>
              {sec.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "mb-px ml-0 flex cursor-pointer items-center gap-[11px] border-l-2 border-transparent py-2.5 pl-[18px] pr-[18px] text-[13px] font-normal text-[rgba(240,238,255,0.6)] transition-all hover:bg-[rgba(155,135,245,0.06)] hover:text-[#f0eeff]",
                      active &&
                        "border-l-[#9b87f5] bg-[rgba(155,135,245,0.08)] text-[#9b87f5]",
                    )}
                  >
                    <span className="w-[18px] shrink-0 text-center text-sm">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span
                        className={cn(
                          "ml-auto rounded-[10px] px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                          item.badgeVariant === "red" &&
                            "border border-[rgba(255,77,106,0.3)] bg-[rgba(255,77,106,0.2)] text-[#ff4d6a]",
                          item.badgeVariant === "green" &&
                            "border border-[rgba(0,229,160,0.25)] bg-[rgba(0,229,160,0.15)] text-[#00e5a0]",
                        )}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-[rgba(155,135,245,0.15)] p-3.5">
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-[rgba(155,135,245,0.15)] bg-[rgba(255,255,255,0.04)] px-3 py-2.5 text-left transition hover:border-[rgba(155,135,245,0.3)] hover:bg-[rgba(155,135,245,0.06)]"
          >
            <div className="relative shrink-0">
              <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-gradient-to-br from-[#9b87f5] to-[#06b6d4] text-xs font-bold text-white">
                {initials}
              </div>
              <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-[#0a0613] bg-[#00e5a0]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-[#f0eeff]">
                {user?.name || "Student"}
              </div>
              <div className="truncate text-[11px] text-[rgba(240,238,255,0.35)]">
                {user?.department
                  ? `${user.department}${user.year != null ? ` · Year ${user.year}` : ""}`
                  : user?.email
                    ? user.email.split("@")[1] ?? "campus"
                    : "Tap to sign out"}
              </div>
            </div>
          </button>
        </div>
      </aside>

      <main className="flex min-h-screen flex-1 flex-col md:ml-[236px]">
        <header className="sticky top-0 z-[100] flex h-[60px] items-center gap-4 border-b border-[rgba(155,135,245,0.15)] bg-[rgba(10,6,19,0.8)] px-4 backdrop-blur-xl md:px-8">
          <div className="font-[family-name:var(--font-syne)] text-[17px] font-semibold md:flex-1">
            {title}
          </div>
          <div className="hidden min-w-[200px] flex-1 items-center gap-2 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3.5 py-2 md:flex md:max-w-md">
            <span className="text-[rgba(240,238,255,0.35)]">⌕</span>
            <input
              type="search"
              placeholder="Search peers, skills, sessions..."
              className="w-full border-0 bg-transparent text-[13px] font-light text-[#f0eeff] outline-none placeholder:text-[rgba(240,238,255,0.35)]"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-[rgba(155,135,245,0.25)] bg-[rgba(155,135,245,0.08)] px-3.5 py-1.5 font-mono text-[13px] font-medium text-[#9b87f5]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9b87f5]" />
              {formatKarmaDisplay(karma)}
            </div>
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-[9px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[15px] transition hover:border-[rgba(155,135,245,0.3)]"
              aria-label="Notifications"
            >
              🔔
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full border border-[#0a0613] bg-[#ff4d6a]" />
            </button>
          </div>
        </header>
        <div className="flex-1 p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
