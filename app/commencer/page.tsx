import Link from "next/link";
import BoutonPayer from "./BoutonPayer";

export const metadata = { title: "Commencer — Fantômes" };

export default function Commencer() {
  return (
    <main className="wrap" style={{ padding: "2.5rem 1.25rem 3rem" }}>
      <p><Link href="/" style={{ color: "var(--caramel)" }}>← Retour à l’accueil</Link></p>
      <h1 className="titre" style={{ fontSize: "2rem" }}>Ton audit complet</h1>
      <p>Mode test : aucun vrai paiement n’est demandé.</p>
      <BoutonPayer />
      <p className="note">Paiement unique de 19 €. Sans abonnement. Satisfait ou remboursé 14 jours.</p>
    </main>
  );
}
