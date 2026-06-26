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

export default function SideNav() {
  const path = usePathname();
  return (
    <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 bg-white border-r border-gray-200 z-50 py-6 px-3">
      <div className="px-3 mb-8">
        <p className="text-xl font-black" style={{ color: "#FF6900" }}>MadSquad</p>
        <p className="text-xs text-gray-400">by MadMix</p>
      </div>
      <div className="space-y-1">
        {NAV.map(({ href, label, Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium
                ${active
                  ? "bg-orange-50"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              style={active ? { color: "#FF6900" } : {}}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
