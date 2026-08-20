"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageCircle,
  Moon,
  PlusCircle,
  Search,
  Sun,
  User
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  type ReactNode,
  useEffect,
  useState,
  useSyncExternalStore
} from "react";

import { createClient } from "@/lib/supabase/client";

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: Home
  },
  {
    href: "/search",
    label: "Discover",
    icon: Search
  },
  {
    href: "/sell",
    label: "List",
    icon: PlusCircle
  },
  {
    href: "/inbox",
    label: "Inbox",
    icon: MessageCircle
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User
  }
];

function subscribeToHydration() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function AppShell({
  children
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const {
    resolvedTheme,
    setTheme
  } = useTheme();

  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot
  );

  const [supabase] = useState(() =>
    createClient()
  );

  const [unreadCount, setUnreadCount] =
    useState(0);

  const isDark =
    mounted &&
    resolvedTheme === "dark";

  useEffect(() => {
    let isActive = true;

    async function loadUnreadCount() {
      try {
        const response = await fetch(
          "/api/messages/unread-count",
          {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin"
          }
        );

        if (!response.ok) {
          if (isActive) {
            setUnreadCount(0);
          }

          return;
        }

        const data = (await response.json()) as {
          unreadCount?: number;
        };

        if (isActive) {
          setUnreadCount(
            Math.max(
              0,
              Number(data.unreadCount) || 0
            )
          );
        }
      } catch {
        if (isActive) {
          setUnreadCount(0);
        }
      }
    }

    function handleUnreadChanged() {
      void loadUnreadCount();
    }

    function handleWindowFocus() {
      void loadUnreadCount();
    }

    void loadUnreadCount();

    const messagesChannel = supabase
      .channel("app-shell-message-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages"
        },
        () => {
          void loadUnreadCount();
        }
      )
      .subscribe();

    window.addEventListener(
      "listed:unread-changed",
      handleUnreadChanged
    );

    window.addEventListener(
      "focus",
      handleWindowFocus
    );

    return () => {
      isActive = false;

      window.removeEventListener(
        "listed:unread-changed",
        handleUnreadChanged
      );

      window.removeEventListener(
        "focus",
        handleWindowFocus
      );

      void supabase.removeChannel(
        messagesChannel
      );
    };
  }, [supabase, pathname]);

  function toggleTheme() {
    setTheme(
      isDark ? "light" : "dark"
    );
  }

  function isNavigationItemActive(
    href: string
  ) {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  function renderNavigationIcon(
    item: (typeof navItems)[number],
    size: number
  ) {
    const Icon = item.icon;
    const showUnreadIndicator =
      item.href === "/inbox" &&
      unreadCount > 0;

    return (
      <span className="relative inline-flex">
        <Icon
          size={size}
          aria-hidden="true"
        />

        {showUnreadIndicator && (
          <span
            className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[var(--background)] bg-red-500"
            aria-hidden="true"
          />
        )}
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <header className="sticky top-0 z-40 hidden border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur md:block">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <Image
              src="/listed-logo.png"
              alt="Listed.lk"
              width={58}
              height={58}
              priority
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

          <nav
            className="flex items-center gap-2"
            aria-label="Main navigation"
          >
            {navItems.map((item) => {
              const active =
                isNavigationItemActive(
                  item.href
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={[
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-[var(--surface)] text-[var(--text)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                  ].join(" ")}
                >
                  {renderNavigationIcon(
                    item,
                    17
                  )}

                  <span>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] transition hover:bg-[var(--surface-soft)]"
            aria-label={
              isDark
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            title={
              isDark
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {mounted ? (
              isDark ? (
                <Sun
                  size={18}
                  aria-hidden="true"
                />
              ) : (
                <Moon
                  size={18}
                  aria-hidden="true"
                />
              )
            ) : (
              <span
                className="h-[18px] w-[18px]"
                aria-hidden="true"
              />
            )}
          </button>
        </div>
      </header>

      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <Image
              src="/listed-logo.png"
              alt="Listed.lk"
              width={46}
              height={46}
              priority
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
            type="button"
            onClick={toggleTheme}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] transition hover:bg-[var(--surface-soft)]"
            aria-label={
              isDark
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            title={
              isDark
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {mounted ? (
              isDark ? (
                <Sun
                  size={18}
                  aria-hidden="true"
                />
              ) : (
                <Moon
                  size={18}
                  aria-hidden="true"
                />
              )
            ) : (
              <span
                className="h-[18px] w-[18px]"
                aria-hidden="true"
              />
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-28 pt-4 md:px-6 md:pb-12 md:pt-8">
        {children}
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--surface)]/95 px-3 pb-5 pt-3 backdrop-blur md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const active =
              isNavigationItemActive(
                item.href
              );

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  active
                    ? "page"
                    : undefined
                }
                className={[
                  "flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-xs font-semibold transition",
                  active
                    ? "text-[var(--text)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
                ].join(" ")}
              >
                {renderNavigationIcon(
                  item,
                  20
                )}

                <span>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}