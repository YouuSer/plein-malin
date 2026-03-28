import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") || "prix";
  const station = searchParams.get("station") || "Station";
  const price = searchParams.get("price") || "1.500";
  const fuel = searchParams.get("fuel") || "E10";
  const city = searchParams.get("city") || "";

  if (type === "prix") {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            color: "white",
            fontFamily: "sans-serif",
            padding: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "#3b82f6",
              }}
            >
              Plein Malin
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(255,255,255,0.08)",
              borderRadius: "24px",
              padding: "40px 60px",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                color: "rgba(255,255,255,0.6)",
                marginBottom: "8px",
              }}
            >
              {fuel} chez {station}
            </div>
            <div
              style={{
                fontSize: "72px",
                fontWeight: 800,
                color: "#22c55e",
                letterSpacing: "-2px",
              }}
            >
              {price} EUR/L
            </div>
            {city && (
              <div
                style={{
                  fontSize: "18px",
                  color: "rgba(255,255,255,0.5)",
                  marginTop: "8px",
                }}
              >
                {city}
              </div>
            )}
          </div>

          <div
            style={{
              fontSize: "16px",
              color: "rgba(255,255,255,0.4)",
              marginTop: "24px",
            }}
          >
            Comparez les prix sur pleinmalin.fr
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // Default / bilan type
  const saved = searchParams.get("saved") || "0";
  const fillups = searchParams.get("fillups") || "0";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          color: "white",
          fontFamily: "sans-serif",
          padding: "40px",
        }}
      >
        <div
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "#3b82f6",
            marginBottom: "30px",
          }}
        >
          Plein Malin
        </div>

        <div
          style={{
            fontSize: "24px",
            color: "rgba(255,255,255,0.7)",
            marginBottom: "16px",
          }}
        >
          Mon bilan carburant
        </div>

        <div
          style={{
            display: "flex",
            gap: "40px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(34,197,94,0.15)",
              borderRadius: "20px",
              padding: "30px 40px",
              border: "1px solid rgba(34,197,94,0.3)",
            }}
          >
            <div style={{ fontSize: "56px", fontWeight: 800, color: "#22c55e" }}>
              {saved} EUR
            </div>
            <div style={{ fontSize: "16px", color: "#22c55e" }}>economises</div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(59,130,246,0.15)",
              borderRadius: "20px",
              padding: "30px 40px",
              border: "1px solid rgba(59,130,246,0.3)",
            }}
          >
            <div style={{ fontSize: "56px", fontWeight: 800, color: "#3b82f6" }}>
              {fillups}
            </div>
            <div style={{ fontSize: "16px", color: "#3b82f6" }}>pleins</div>
          </div>
        </div>

        <div
          style={{
            fontSize: "16px",
            color: "rgba(255,255,255,0.4)",
            marginTop: "30px",
          }}
        >
          Comparez les prix sur pleinmalin.fr
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
