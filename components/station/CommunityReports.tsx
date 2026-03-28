"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface Report {
  id: number;
  reportType: string;
  fuelType: string | null;
  reportedPrice: number | null;
  comment: string | null;
  createdAt: string;
  userName: string | null;
}

interface CommunityReportsProps {
  stationId: string;
}

const REPORT_LABELS: Record<string, string> = {
  price_confirm: "Prix confirme",
  price_wrong: "Prix incorrect",
  closed: "Station fermee",
  queue: "File d'attente",
  shortage: "Rupture de stock",
};

export function CommunityReports({ stationId }: CommunityReportsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [confirmations, setConfirmations] = useState(0);
  const [showReportMenu, setShowReportMenu] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/community/reports?stationId=${stationId}`
      );
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports ?? []);
        setConfirmations(data.confirmations24h ?? 0);
      }
    } catch {
      // ignore
    }
  }, [stationId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const submitReport = async (reportType: string) => {
    if (!session?.user) {
      router.push("/connexion");
      return;
    }

    await fetch("/api/community/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stationId, reportType }),
    });

    setShowReportMenu(false);
    fetchReports();
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold">Communaute</h2>
        {confirmations > 0 && (
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full animate-scale-in"
            style={{
              background: "var(--brand-gradient-subtle)",
              color: "var(--brand)",
            }}
          >
            {confirmations} confirmation{confirmations > 1 ? "s" : ""} (24h)
          </span>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex gap-2.5 mb-3">
        <button
          onClick={() => submitReport("price_confirm")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-all tap-scale"
          style={{
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08))",
            color: "var(--price-low)",
            border: "1.5px solid rgba(16, 185, 129, 0.25)",
            borderRadius: "var(--radius)",
          }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.46L7.82 10.12a.75.75 0 00-1.14.976l2.25 2.625a.75.75 0 001.177-.047l3.75-5.483z" clipRule="evenodd" />
          </svg>
          Prix OK
        </button>
        <button
          onClick={() => setShowReportMenu(!showReportMenu)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-all tap-scale"
          style={{
            background: "var(--surface-secondary)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
          }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          Signaler
        </button>
      </div>

      {/* Report menu */}
      {showReportMenu && (
        <div
          className="overflow-hidden mb-3 animate-fade-in-down"
          style={{
            border: "1px solid var(--border)",
            background: "var(--surface)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {["price_wrong", "closed", "queue", "shortage"].map(
            (type, i, arr) => (
              <button
                key={type}
                onClick={() => submitReport(type)}
                className="w-full px-4 py-3 text-left text-sm font-medium transition-all tap-scale"
                style={{
                  borderBottom:
                    i < arr.length - 1
                      ? "1px solid var(--border)"
                      : undefined,
                }}
              >
                {REPORT_LABELS[type]}
              </button>
            )
          )}
        </div>
      )}

      {/* Recent reports */}
      {reports.length > 0 && (
        <div className="space-y-2">
          {reports.slice(0, 5).map((report, i) => (
            <div
              key={report.id}
              className={`flex items-center gap-2.5 text-xs px-3 py-2 animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}
              style={{
                background: "var(--surface-secondary)",
                borderRadius: "var(--radius)",
              }}
            >
              <span
                className="font-bold"
                style={{
                  color:
                    report.reportType === "price_confirm"
                      ? "var(--price-low)"
                      : "var(--text-secondary)",
                }}
              >
                {REPORT_LABELS[report.reportType] ?? report.reportType}
              </span>
              <span style={{ color: "var(--text-tertiary)" }}>
                · {report.userName ?? "Anonyme"} ·{" "}
                {formatAgo(report.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function formatAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min}min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}j`;
}
