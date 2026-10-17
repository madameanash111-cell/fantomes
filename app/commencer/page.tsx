import Link from "next/link";

export const metadata = { title: "Commencer — Fantômes" };

export default function Commencer() {
  return (
    <main className="wrap" style={{ padding: "2.5rem 1.25rem 3rem" }}>
      <p><Link href="/" style={{ color: "var(--caramel)" }}>← Retour à l’accueil</Link></p>
      <h1 className="titre" style={{ fontSize: "2rem" }}>On prépare ton enquête.</h1>
      <p>Dans quelques jours, tu pourras déposer ton relevé ici et voir tes premiers fantômes apparaître.</p>
      <p style={{ opacity: 0.6 }}>Cette page est en construction.</p>
    </main>
  );
}
