import Link from "next/link";

export const metadata = { title: "Paiement non abouti — Fantômes" };

export default function PaiementEchoue() {
  return (
    <main className="wrap" style={{ padding: "2.5rem 1.25rem 3rem" }}>
      <h1 className="titre" style={{ fontSize: "2rem" }}>Le paiement n’a pas abouti.</h1>
      <p>Rien n’a été débité. Tu peux réessayer, ou écrire à madameanash111@gmail.com si le problème continue.</p>
      <p><Link href="/commencer" style={{ color: "var(--caramel)" }}>Réessayer</Link></p>
    </main>
  );
}
