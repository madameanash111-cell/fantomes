import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import "./globals.css";

const titre = Fraunces({ subsets: ["latin"], variable: "--font-titre", display: "swap" });
const texte = Instrument_Sans({ subsets: ["latin"], variable: "--font-texte", display: "swap" });

const titreSite = "Fantômes — Débusque les abonnements que tu paies sans t’en servir";
const description = "Dépose ton relevé : on repère les prélèvements oubliés et on écrit les lettres de résiliation pour toi.";

export const metadata: Metadata = {
  metadataBase: new URL("https://fantomes-sable-omega.vercel.app"),
  title: titreSite,
  description,
  openGraph: { title: titreSite, description, locale: "fr_FR", type: "website", siteName: "Fantômes" },
  twitter: { card: "summary_large_image", title: titreSite, description },
};

export const viewport: Viewport = { themeColor: "#14110f" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${titre.variable} ${texte.variable}`}>
      <body>{children}</body>
    </html>
  );
}
