export const metadata = {
  title: "Fantômes — Débusque les abonnements que tu paies sans t’en servir",
  description: "Repère en quelques secondes les prélèvements oubliés sur ton relevé bancaire.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
