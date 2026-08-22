import { Link, useRouterState } from "@tanstack/react-router";
import { HeartHandshake, MessageCircleHeart, Home } from "lucide-react";
import { useSaathi } from "@/lib/saathi-store";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { t } = useSaathi();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (pathname === "/") return null;

  const items = [
    { to: "/", icon: Home, label: t.home },
    { to: "/talk", icon: MessageCircleHeart, label: t.appName.split(" ")[1] ?? "Saathi" },
    { to: "/check-in", icon: HeartHandshake, label: t.checkIn },
  ] as const;

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-border bg-card/95 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-xl">
        {items.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 px-2 py-2 text-base font-semibold",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon aria-hidden className="size-7" />
                <span className="text-center leading-tight">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
