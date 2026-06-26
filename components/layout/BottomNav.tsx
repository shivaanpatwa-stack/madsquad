"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Brain, Gift, BarChart2 } from "lucide-react";

const NAV = [
  { href: "/",         label: "Home",     Icon: Home       },
  { href: "/log-sale", label: "Log Sale", Icon: PlusCircle },
  { href: "/mentor",   label: "Mentor",   Icon: Brain      },
  { href: "/rewards",  label: "Rewards",  Icon: Gift       },
  { href: "/hq",       label: "HQ",       Icon: BarChart2  },
];

export default function BottomNav() {
  const path = usePathname();
  const isHQ = path.startsWith("/hq");

  return (
    // Seller pages: show on all screen sizes (phone frame on desktop aligns with it)
    // HQ page: hide on desktop only (sidebar handles nav), keep on mobile
    <nav
      className={`${isHQ ? "md:hidden" : ""} fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white`}
      style={{
        borderTop: "1px solid #F0E6D8",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        boxShadow: "0 -2px 12px rgba(26,18,0,0.06)",
      }}
    >
      <div className="flex items-center justify-around h-16">
        {NAV.map(({ href, label, Icon }) => {
          const active = path === href || (href === "/hq" && isHQ);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 flex-1 py-2 transition-colors"
              style={{ color: active ? "#FF6900" : "#9C8870" }}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
