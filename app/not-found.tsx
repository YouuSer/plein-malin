import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
      <div
        className="text-6xl font-bold mb-3"
        style={{ color: "var(--text-tertiary)" }}
      >
        404
      </div>
      <h2 className="text-lg font-semibold mb-2">Page introuvable</h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        Cette page n&apos;existe pas ou a ete deplacee.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg"
        style={{ background: "var(--brand)" }}
      >
        Retour a la carte
      </Link>
    </div>
  );
}
