export default function Loading() {
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div
          className="w-12 h-12 rounded-full mx-auto mb-4"
          style={{
            border: "3px solid var(--border)",
            borderTopColor: "transparent",
            borderRightColor: "transparent",
            background: "conic-gradient(from 0deg, transparent 0%, var(--brand) 75%, transparent 100%)",
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p className="text-sm font-semibold" style={{ color: "var(--text-tertiary)" }}>
          Chargement...
        </p>
      </div>
    </div>
  );
}
