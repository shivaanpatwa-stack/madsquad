import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/store/AppContext";
import BottomNav from "@/components/layout/BottomNav";
import PhoneFrame from "@/components/layout/PhoneFrame";

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
          <PhoneFrame>
            {children}
          </PhoneFrame>
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
