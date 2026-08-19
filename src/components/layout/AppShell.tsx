"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Search,
  PlusCircle,
  MessageCircle,
  User,
  Moon,
  Sun
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Discover", icon: Search },
  { href: "/sell", label: "List", icon: PlusCircle },
  { href: "/inbox", label: "Inbox", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <header className="sticky top-0 z-40 hidden border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur md:block">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/listed-logo.png"
              alt="Listed.lk"
              width={58}
              height={58}
              className="rounded-xl object-contain"
            />
            <div>
              <div className="text-2xl font-black tracking-tight">
                Listed.lk
              </div>
              <div className="text-sm text-[var(--text-muted)]">
                Listed ? Sold !
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold hover:bg-[var(--surface)]"
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={toggleTheme}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/listed-logo.png"
              alt="Listed.lk"
              width={46}
              height={46}
              className="rounded-xl object-contain"
            />
            <div>
              <div className="text-lg font-black tracking-tight">
                Listed.lk
              </div>
              <div className="text-xs font-semibold text-[var(--text-muted)]">
                Listed ? Sold !
              </div>
            </div>
          </Link>

          <button
            onClick={toggleTheme}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-28 pt-4 md:px-6 md:pb-12 md:pt-8">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--surface)]/95 px-3 pb-5 pt-3 backdrop-blur md:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-xs font-semibold text-[var(--text-muted)]"
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}