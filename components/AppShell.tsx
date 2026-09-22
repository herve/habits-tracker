import type { ReactNode } from "react";
import Header from "./Header";
import BottomNavigation from "./BottomNavigation";

export default function AppShell({ active, children }: { active: "habits" | "stats"; children: ReactNode }) {
  return (
    <div className="app-shell">
      <div className="app-scroll-area">
        <Header />
        {children}
      </div>
      <BottomNavigation active={active} />
    </div>
  );
}
