"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isOnboarding = path === "/onboarding";

  if (isOnboarding) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#FFF8F0" }}>
      <Sidebar />
      <main className="flex-1 min-w-0 pb-16 lg:pb-0 lg:ml-60">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
