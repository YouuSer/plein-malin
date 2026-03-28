"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";

export default function InscriptionPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caracteres");
      setLoading(false);
      return;
    }

    try {
      const result = await signUp.email({ name, email, password });
      if (result.error) {
        setError(result.error.message ?? "Erreur lors de l'inscription");
      } else {
        router.push("/");
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-dvh flex items-center justify-center px-5 py-8"
      style={{
        background:
          "radial-gradient(circle at 15% 15%, rgba(89,195,190,0.12), rgba(89,195,190,0) 35%), radial-gradient(circle at 85% 80%, rgba(0,128,96,0.22), rgba(0,128,96,0) 35%), #0f141b",
      }}
    >
      <div className="w-full max-w-sm rounded-3xl overflow-hidden border animate-fade-in-up" style={{ borderColor: "rgba(255,255,255,0.14)", background: "rgba(16, 22, 31, 0.82)", boxShadow: "var(--shadow-lg)" }}>
        <div className="px-6 pt-6 pb-5 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm" style={{ background: "var(--brand-gradient)", backgroundImage: "var(--brand-gradient)" }}>
              PM
            </div>
            <div>
              <div className="text-white font-semibold">Plein Malin</div>
              <div className="text-xs" style={{ color: "#9da9b8" }}>Nouveau compte</div>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-white">Creer un compte</h1>
          <p className="text-sm mt-1" style={{ color: "#aab4c3" }}>
            Enregistrez vos pleins et suivez vos economies.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="text-sm font-medium px-3 py-2.5 rounded-lg animate-fade-in-down" style={{ background: "rgba(244,116,116,0.14)", border: "1px solid rgba(244,116,116,0.3)", color: "#ffb4b4" }}>
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold" htmlFor="name" style={{ color: "#d8e0eb" }}>
              Prenom
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-3 text-sm font-medium outline-none rounded-xl"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.16)", color: "#eff3fa" }}
              placeholder="Votre prenom"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold" htmlFor="email" style={{ color: "#d8e0eb" }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-3 text-sm font-medium outline-none rounded-xl"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.16)", color: "#eff3fa" }}
              placeholder="vous@exemple.fr"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold" htmlFor="password" style={{ color: "#d8e0eb" }}>
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3.5 py-3 text-sm font-medium outline-none rounded-xl"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.16)", color: "#eff3fa" }}
              placeholder="8 caracteres minimum"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm font-bold text-white rounded-xl disabled:opacity-60"
            style={{ background: "var(--brand-gradient)", backgroundImage: "var(--brand-gradient)" }}
          >
            {loading ? "Creation..." : "Creer mon compte"}
          </button>

          <div className="text-center text-sm" style={{ color: "#aab4c3" }}>
            Deja un compte ?{" "}
            <Link href="/connexion" className="font-semibold" style={{ color: "#d7f7ee" }}>
              Se connecter
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
