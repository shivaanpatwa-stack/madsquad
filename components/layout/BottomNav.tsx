"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Brain, Gift, MapPin } from "lucide-react";

const NAV = [
  { href: "/",          label: "Home",     Icon: Home       },
  { href: "/log-sale",  label: "Log Sale", Icon: PlusCircle },
  { href: "/mentor",    label: "Mentor",   Icon: Brain      },
  { href: "/rewards",   label: "Rewards",  Icon: Gift       },
  { href: "/territory", label: "My Zone",  Icon: MapPin     },
];

export default function BottomNav() {
  const path = usePathname();
  if (path === "/onboarding") return null;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white"
      style={{
        borderTop: "1px solid #F0E6D8",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        boxShadow: "0 -2px 12px rgba(26,18,0,0.06)",
      }}
    >
      <div className="flex items-center justify-around h-16">
        {NAV.map(({ href, label, Icon }) => {
          const active = path === href || (href !== "/" && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 flex-1 py-2"
              style={{ color: active ? "#FF6900" : "#9C8870" }}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
