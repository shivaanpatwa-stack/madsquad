import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/store/AppContext";
import BottomNav from "@/components/layout/BottomNav";
import SideNav from "@/components/layout/SideNav";

export const metadata: Metadata = {
  title: "MadSquad",
  description: "The MadMix partner network app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <SideNav />
          <main className="md:ml-56 pb-nav md:pb-0">
            {children}
          </main>
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
