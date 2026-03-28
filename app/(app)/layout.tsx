"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileFuelBar } from "@/components/layout/MobileFuelBar";
import { MobileSidebarDrawer } from "@/components/layout/MobileSidebarDrawer";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { FuelFilterProvider } from "@/contexts/FuelFilterContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const handleCloseMobileDrawer = useCallback(() => {
    setMobileDrawerOpen(false);
  }, []);

  return (
    <FuelFilterProvider>
      <div className="flex h-dvh flex-col overflow-hidden">
        <TopBar onMenuClick={() => setMobileDrawerOpen(true)} />
        <MobileFuelBar />
        <OnboardingGate />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={handleToggleSidebar}
            className="hidden lg:flex"
          />

          <MobileSidebarDrawer
            open={mobileDrawerOpen}
            onClose={handleCloseMobileDrawer}
          />

          <main className="flex-1 overflow-hidden" style={{ background: "var(--bg-page)" }}>
            {children}
          </main>
        </div>
      </div>
    </FuelFilterProvider>
  );
}
