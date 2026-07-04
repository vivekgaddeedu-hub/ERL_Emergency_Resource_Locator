"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Users, Mic, Map } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: typeof Heart };

const ITEMS: NavItem[] = [
  { href: "/", label: "Emergency", icon: Heart },
  { href: "/resources", label: "Nearby", icon: Map },
  { href: "/family", label: "Family", icon: Users },
  { href: "/voice", label: "Voice", icon: Mic },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur"
    >
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-pill bg-emergency text-white">
            <Heart className="h-4 w-4" aria-hidden />
          </span>
          <span className="font-display text-base font-bold tracking-wide">ERL</span>
        </Link>
        <ul className="flex items-center gap-1">
          {ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-pill px-3 py-2 text-xs font-semibold transition-colors",
                    isActive
                      ? "bg-foreground text-background"
                      : "text-foreground hover:bg-card"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
