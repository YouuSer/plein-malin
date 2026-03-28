import { MobileNav } from "@/components/layout/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-dvh">
      <main className="flex-1 relative overflow-hidden">{children}</main>
      <MobileNav />
    </div>
  );
}
