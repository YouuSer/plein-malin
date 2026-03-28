"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold mb-2">Oups, une erreur</h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        {error.message || "Quelque chose s'est mal passe. Reessayez."}
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
        style={{ background: "var(--accent)" }}
      >
        Reessayer
      </button>
    </div>
  );
}
