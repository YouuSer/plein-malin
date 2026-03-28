"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface CitySuggestion {
  city: string;
  postalCode: string;
  department: string | null;
  lat: number;
  lng: number;
}

interface SearchBarProps {
  onSelect: (position: { lat: number; lng: number }, label: string) => void;
  tone?: "default" | "topbar";
}

export function SearchBar({ onSelect, tone = "default" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isTopbar = tone === "topbar";

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/cities?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.cities ?? []);
      setIsOpen(true);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 250);
  };

  const handleSelect = (suggestion: CitySuggestion) => {
    const label = `${suggestion.city} (${suggestion.postalCode})`;
    setQuery(label);
    setIsOpen(false);
    onSelect({ lat: suggestion.lat, lng: suggestion.lng }, label);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className="flex items-center gap-2 px-3 py-2.5 transition-all"
        style={{
          background: isTopbar ? "var(--topbar-input-bg)" : "var(--surface-secondary)",
          borderRadius: "12px",
          border: isFocused
            ? `1px solid ${isTopbar ? "#546176" : "var(--brand)"}`
            : `1px solid ${isTopbar ? "var(--topbar-input-border)" : "transparent"}`,
          boxShadow: isFocused
            ? isTopbar
              ? "0 0 0 2px rgba(95, 114, 138, 0.2)"
              : "0 0 0 3px rgba(0, 128, 96, 0.12)"
            : "none",
        }}
      >
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 shrink-0"
          style={{ color: isTopbar ? "#9ea8b6" : "var(--text-tertiary)" }}
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder="Rechercher une ville..."
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: isTopbar ? "#ebeff5" : "var(--text-primary)" }}
        />
        {query ? (
          <button
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="shrink-0"
            style={{ color: isTopbar ? "#a3afbe" : "var(--text-tertiary)" }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        ) : (
          <kbd
            className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded"
            style={{
              background: isTopbar ? "rgba(255, 255, 255, 0.06)" : "var(--surface)",
              border: `1px solid ${isTopbar ? "rgba(255, 255, 255, 0.14)" : "var(--border)"}`,
              color: isTopbar ? "#9ea8b6" : "var(--text-tertiary)",
            }}
          >
            <span className="text-xs">⌘</span>K
          </kbd>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 overflow-hidden z-50 animate-fade-in"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {suggestions.map((s, i) => (
            <button
              key={`${s.postalCode}-${s.city}-${i}`}
              onClick={() => handleSelect(s)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[var(--surface-secondary)]"
              style={{
                borderBottom: i < suggestions.length - 1 ? "1px solid var(--border)" : undefined,
              }}
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 shrink-0"
                style={{ color: "var(--text-tertiary)" }}
              >
                <path
                  fillRule="evenodd"
                  d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <div className="text-sm font-medium">{s.city}</div>
                <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {s.postalCode}
                  {s.department && ` · ${s.department}`}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
