"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function KnodeHeader() {
  const { user, ready, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(155,135,245,0.15)] bg-[rgba(10,6,19,0.85)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#9b87f5] to-[#6d5ce7] font-[family-name:var(--font-syne)] text-sm font-extrabold text-white",
              "shadow-[0_0_20px_rgba(155,135,245,0.4)] transition-shadow group-hover:shadow-[0_0_28px_rgba(155,135,245,0.55)]",
            )}
          >
            K
          </span>
          <span className="font-[family-name:var(--font-syne)] text-base font-bold tracking-tight text-[#f0eeff]">
            Kno<span className="text-[#9b87f5]">de</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {ready && user ? (
            <>
              {[
                ["Dashboard", "/dashboard"],
                ["Profile", "/profile"],
                ["Skills", "/skills"],
                ["Match", "/match"],
                ["SOS", "/sos"],
                ["Ledger", "/ledger"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-md px-2.5 py-1.5 text-sm text-[rgba(240,238,255,0.55)] transition-colors hover:bg-[rgba(155,135,245,0.08)] hover:text-[#f0eeff] sm:px-3"
                >
                  {label}
                </Link>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="ml-1 border-[rgba(155,135,245,0.25)] bg-transparent text-[#f0eeff]"
                onClick={() => logout()}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="shadow-md shadow-primary/25">
                  Register
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
