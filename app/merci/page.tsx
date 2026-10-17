import Link from "next/link";

export const metadata = { title: "Merci — Fantômes" };

export default function Merci() {
  return (
    <main className="wrap" style={{ padding: "2.5rem 1.25rem 3rem" }}>
      <h1 className="titre" style={{ fontSize: "2rem" }}>Merci, c’est payé.</h1>
      <p>Ton paiement est bien arrivé. L’accès à ton audit complet s’ouvrira ici dès que l’outil sera prêt.</p>
      <p>Un souci ? Écris à madameanash111@gmail.com : tu es remboursée sous 14 jours, sans justification.</p>
      <p><Link href="/" style={{ color: "var(--caramel)" }}>← Retour à l’accueil</Link></p>
    </main>
  );
}
