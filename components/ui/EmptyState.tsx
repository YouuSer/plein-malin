import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-6 animate-fade-in-up">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-float"
        style={{
          background: "var(--brand-gradient-subtle)",
          color: "var(--brand)",
        }}
      >
        {icon}
      </div>
      <h3 className="text-base font-bold mb-1.5">{title}</h3>
      <p className="text-sm mb-5" style={{ color: "var(--text-tertiary)" }}>
        {description}
      </p>
      {action}
    </div>
  );
}
