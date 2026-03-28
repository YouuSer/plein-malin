import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plein Malin - Le plein au meilleur prix",
  description:
    "Comparez les prix de l'essence en temps reel et trouvez la station la moins chere pres de chez vous.",
  openGraph: {
    title: "Plein Malin - Le plein au meilleur prix",
    description:
      "Comparez les prix de l'essence en temps reel pres de chez vous.",
    type: "website",
    locale: "fr_FR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
};

const themeScript = `
  (function() {
    var theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
