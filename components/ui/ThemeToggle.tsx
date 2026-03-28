"use client";

import { useState, useEffect } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const current = stored ?? "light";
    setTheme(current);
    document.documentElement.setAttribute("data-theme", current);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-between w-full px-3 py-2 text-sm transition-all tap-scale rounded-xl"
      style={{
        background: "var(--surface-secondary)",
        border: "1px solid var(--border)",
      }}
      type="button"
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: theme === "light" ? "var(--amber-soft)" : "var(--accent-soft)" }}
        >
          {theme === "light" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} className="w-4 h-4" style={{ color: "var(--amber)" }}>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.64 5.64l1.41 1.41M18.36 18.36l-1.41-1.41M18.36 5.64l-1.41 1.41M5.64 18.36l1.41-1.41" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} className="w-4 h-4" style={{ color: "var(--brand-cyan)" }}>
              <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
            </svg>
          )}
        </div>
        <span className="font-semibold">{theme === "light" ? "Mode clair" : "Mode sombre"}</span>
      </div>

      <div
        className="w-10 h-5 rounded-full relative transition-all"
        style={{
          background: theme === "dark" ? "var(--brand-gradient)" : "var(--border)",
          backgroundImage: theme === "dark" ? "var(--brand-gradient)" : undefined,
        }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
          style={{
            transform: theme === "dark" ? "translateX(20px)" : "translateX(2px)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
          }}
        />
      </div>
    </button>
  );
}
