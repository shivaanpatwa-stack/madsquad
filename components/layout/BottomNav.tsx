"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Brain, Gift, BarChart2 } from "lucide-react";

const NAV = [
  { href: "/",          label: "Home",    Icon: Home       },
  { href: "/log-sale",  label: "Log Sale", Icon: PlusCircle },
  { href: "/coach",     label: "Coach",   Icon: Brain      },
  { href: "/rewards",   label: "Rewards", Icon: Gift       },
  { href: "/hq",        label: "HQ",      Icon: BarChart2  },
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50
                 bg-white border-t border-gray-200 shadow-lg"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-16">
        {NAV.map(({ href, label, Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 flex-1 py-2 transition-colors
                ${active ? "text-[#E63012]" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] font-medium ${active ? "font-bold" : ""}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
