import type { ReactNode } from "react";
import { MobileNav, Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen mesh-bg">
      <Sidebar />
      <main className="md:pl-64 pb-20 md:pb-0 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}

export function WideAppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen mesh-bg">
      <Sidebar />
      <main className="md:pl-64 pb-20 md:pb-0 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}
